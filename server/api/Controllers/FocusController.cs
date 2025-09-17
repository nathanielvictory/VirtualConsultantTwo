using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Dtos;
using api.Messaging.Abstractions;
using api.Messaging.IntegrationEvents;
using api.Models;

namespace api.Controllers;

[Route("api/QueueTask")]
[ApiController]
[Authorize]
public class QueueTaskController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITaskEventPublisher _publisher;

    private static readonly JsonSerializerOptions SnakeJson = new()
    {
        PropertyNamingPolicy = null,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public QueueTaskController(AppDbContext db, ITaskEventPublisher publisher)
    {
        _db = db;
        _publisher = publisher;
    }

    // POST api/QueueTask/insights
    [HttpPost("insights")]
    public async Task<IActionResult> QueueInsights([FromBody] QueueCreateInsightsTaskDto dto)
        => await CreateAndPublishAsync(
            dto.ProjectId,
            TaskJobType.Insights,
            (task, proj) => new
            {
                task_id = task.Id,
                project_id = proj.Id,
                kbid = proj.KbId,
                key_number = proj.KeyNumber
                // token_limit optional; omit for now
            });

    // POST api/QueueTask/full-report
    [HttpPost("full-report")]
    public async Task<IActionResult> QueueFullReport([FromBody] QueueCreateFullReportTaskDto dto)
        => await CreateAndPublishAsync(
            dto.ProjectId,
            TaskJobType.FullReport,
            (task, proj) => new
            {
                task_id = task.Id,
                project_id = proj.Id,
                kbid = proj.KbId,
                key_number = proj.KeyNumber,
                doc_id = "1R3iFZdvb-EHX8A5ZuHvss_0ZPJal15-uxMz4tOfTDS0",
                sheets_id = "1US9PKrFlIZI-44lA7zZtfaWQoCSjVPOrfSCXQlwycXg",
                slides_id = "1xXayw9SkskXMQ8hO828sxz1BNdttoTcT7eXsOs78ADI"
                // token_limit optional; omit for now
            });

    // POST api/QueueTask/memo
    [HttpPost("memo")]
    public async Task<IActionResult> QueueMemo([FromBody] QueueCreateMemoTaskDto dto)
        => await CreateAndPublishAsync(
            dto.ProjectId,
            TaskJobType.Memo,
            (task, proj) => new
            {
                task_id = task.Id,
                project_id = proj.Id,
                kbid = proj.KbId,
                key_number = proj.KeyNumber,
                doc_id = "1R3iFZdvb-EHX8A5ZuHvss_0ZPJal15-uxMz4tOfTDS0"
                // token_limit optional; omit for now
            });

    // POST api/QueueTask/slides
    [HttpPost("slides")]
    public async Task<IActionResult> QueueSlides([FromBody] QueueCreateSlidesTaskDto dto)
        => await CreateAndPublishAsync(
            dto.ProjectId,
            TaskJobType.Slides,
            (task, proj) => new
            {
                task_id = task.Id,
                project_id = proj.Id,
                kbid = proj.KbId,
                key_number = proj.KeyNumber,
                doc_id = "1R3iFZdvb-EHX8A5ZuHvss_0ZPJal15-uxMz4tOfTDS0",
                sheets_id = "1US9PKrFlIZI-44lA7zZtfaWQoCSjVPOrfSCXQlwycXg",
                slides_id = "1xXayw9SkskXMQ8hO828sxz1BNdttoTcT7eXsOs78ADI"
                // token_limit optional; omit for now
            });

    // POST api/QueueTask/survey-data
    [HttpPost("survey-data")]
    public async Task<IActionResult> QueueSurveyData([FromBody] QueueCreateSurveyDataTaskDto dto)
        => await CreateAndPublishAsync(
            dto.ProjectId,
            TaskJobType.SurveyData,
            (task, proj) => new
            {
                task_id = task.Id,
                project_id = proj.Id,
                kbid = proj.KbId,
                key_number = proj.KeyNumber
            });

    // ---- Shared flow -------------------------------------------------------

    private async Task<IActionResult> CreateAndPublishAsync<TPayload>(
        int projectId,
        TaskJobType jobType,
        Func<TaskJob, ProjectShape, TPayload> payloadFactory)
    {
        // 1) Load project & required props (adjust names if yours differ)
        var proj = await _db.Projects
            .AsNoTracking()
            .Where(p => p.Id == projectId)
            .Select(p => new ProjectShape
            {
                Id = p.Id,
                KbId = p.Kbid,
                KeyNumber = 0
            })
            .SingleOrDefaultAsync();

        if (proj is null)
            return NotFound($"Project {projectId} not found.");

        // 2) Resolve user from auth
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!int.TryParse(idClaim, out var userId))
            return BadRequest("Authenticated user required (no numeric user id claim found).");

        // 3) Create TaskJob and save to get Id
        var task = new TaskJob
        {
            ProjectId = projectId,
            CreatedByUserId = userId,
            JobType = jobType,
            JobStatus = TaskJobStatus.Queued,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync(); // assigns task.Id

        // 4) Build payload matching worker schema (snake_case, no extras)
        var payloadObj = payloadFactory(task, proj);
        task.PayloadJson = JsonSerializer.Serialize(payloadObj, SnakeJson);

        _db.Tasks.Update(task);
        await _db.SaveChangesAsync();

        // 5) Publish integration event
        var evt = new TaskCreatedEvent(
            TaskId: task.Id,
            ProjectId: task.ProjectId,
            CreatedByUserId: task.CreatedByUserId,
            JobType: task.JobType,
            PayloadJson: task.PayloadJson,
            CreatedAt: task.CreatedAt
        );

        await _publisher.PublishAsync(jobType, task.PayloadJson, HttpContext.RequestAborted);

        // 6) 202 Accepted + poll URL
        var pollUrl = Url.Action("GetTask", "Tasks", new { id = task.Id }, Request.Scheme) ?? $"/api/tasks/{task.Id}";
        return Accepted(pollUrl, new
        {
            task.Id,
            task.ProjectId,
            Status = task.JobStatus.ToString(),
            Poll = pollUrl
        });
    }

    private sealed class ProjectShape
    {
        public int Id { get; set; }
        public string KbId { get; set; } = null!;
        public int KeyNumber { get; set; }
    }
}
