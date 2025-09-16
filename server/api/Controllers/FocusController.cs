using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Dtos;
using api.Messaging.Abstractions;
using api.Messaging.IntegrationEvents;
using api.Models;

namespace api.Controllers;

[Route("api/projects/{projectId:int}/focus")]
[ApiController]
[Authorize] // keep auth; DTO also allows CreatedByUserId for smoke tests
public class FocusController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITaskEventPublisher _publisher;

    public FocusController(AppDbContext db, ITaskEventPublisher publisher)
    {
        _db = db;
        _publisher = publisher;
    }

    [HttpPost]
    public async Task<IActionResult> CreateFocus(int projectId, [FromBody] CreateFocusDto dto)
    {
        // 1) Validate project exists
        var projectExists = await _db.Projects.AsNoTracking().AnyAsync(p => p.Id == projectId);
        if (!projectExists) return NotFound($"Project {projectId} not found.");

        // 2) Resolve CreatedByUserId:
        int? userId = dto.CreatedByUserId;
        if (userId is null)
        {
            // try to pull from auth (sub / nameidentifier)
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (int.TryParse(idClaim, out var parsed)) userId = parsed;
        }
        if (userId is null) return BadRequest("CreatedByUserId is required for this request (or provide an authenticated user).");

        // 3) Create TaskJob
        var payload = JsonSerializer.Serialize(new { dto.Prompt, dto.Metadata }, new JsonSerializerOptions(JsonSerializerDefaults.Web));

        var task = new TaskJob
        {
            ProjectId = projectId,
            CreatedByUserId = userId.Value,
            JobType = TaskJobType.GenerateInsights,
            JobStatus = TaskJobStatus.Queued,
            PayloadJson = payload,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        // 4) Publish integration event
        var evt = new TaskCreatedEvent(
            TaskId: task.Id,
            ProjectId: task.ProjectId,
            CreatedByUserId: task.CreatedByUserId,
            JobType: task.JobType,
            PayloadJson: task.PayloadJson,
            CreatedAt: task.CreatedAt
        );

        await _publisher.PublishTaskCreatedAsync(evt, HttpContext.RequestAborted);

        // 5) Return 202 Accepted with a link to poll the task
        var pollUrl = Url.Action("GetTask", "Tasks", new { id = task.Id }, Request.Scheme) ?? $"/api/tasks/{task.Id}";
        return Accepted(pollUrl, new
        {
            task.Id,
            task.ProjectId,
            Status = task.JobStatus.ToString(),
            Poll = pollUrl
        });
    }
}
