using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Net;
using System.Text.Json;

namespace api.Middleware;

public class DbConstraintExceptionMiddleware
{
    private readonly RequestDelegate _next;
    public DbConstraintExceptionMiddleware(RequestDelegate next) => _next = next;

    public async Task Invoke(HttpContext ctx)
    {
        try
        {
            await _next(ctx);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException pg)
        {
            var (status, title) = pg.SqlState switch
            {
                PostgresErrorCodes.UniqueViolation     => (HttpStatusCode.Conflict, "Unique constraint violation"),
                PostgresErrorCodes.ForeignKeyViolation => (HttpStatusCode.Conflict, "Foreign key violation"),
                PostgresErrorCodes.NotNullViolation    => (HttpStatusCode.BadRequest, "Required field missing"),
                PostgresErrorCodes.CheckViolation      => (HttpStatusCode.BadRequest, "Check constraint violation"),
                _                                      => (HttpStatusCode.BadRequest, "Database constraint violation")
            };

            var problem = new
            {
                type = "https://httpstatuses.com/" + (int)status,
                title,
                status = (int)status,
                detail = "A database constraint was violated.",
                traceId = ctx.TraceIdentifier
            };

            ctx.Response.ContentType = "application/problem+json";
            ctx.Response.StatusCode = (int)status;
            await ctx.Response.WriteAsync(JsonSerializer.Serialize(problem));
        }
    }
}