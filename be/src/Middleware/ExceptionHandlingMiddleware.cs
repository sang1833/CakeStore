using System.Net;
using System.Text.Json;
using cake_store_api.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace cake_store_api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "An unexpected error occurred.");

        ProblemDetails problemDetails;

        switch (exception)
        {
            case NotFoundException notFoundEx:
                problemDetails = new ProblemDetails
                {
                    Status = (int)HttpStatusCode.NotFound,
                    Title = "Not Found",
                    Detail = notFoundEx.Message
                };
                break;
            case InventoryException inventoryEx:
                problemDetails = new ProblemDetails
                {
                    Status = (int)HttpStatusCode.Conflict,
                    Title = "Inventory Conflict",
                    Detail = inventoryEx.Message
                };
                break;
            case ValidationException validationEx:
                problemDetails = new ProblemDetails
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Title = "Validation Error",
                    Detail = validationEx.Message
                };
                break;
            default:
                problemDetails = new ProblemDetails
                {
                    Status = (int)HttpStatusCode.InternalServerError,
                    Title = "An error occurred while processing your request.",
                    Detail = exception.ToString() // Exposed for debugging
                };
                break;
        }

        context.Response.StatusCode = problemDetails.Status.Value;
        context.Response.ContentType = "application/problem+json";

        var json = JsonSerializer.Serialize(problemDetails);
        await context.Response.WriteAsync(json);
    }
}
