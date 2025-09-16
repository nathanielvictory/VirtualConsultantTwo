namespace api.Dtos;

public class CreateFocusDto
{
    // Optional freeform hint the worker can use
    public string? Prompt { get; set; }

    // Arbitrary passthrough values for the worker
    public IDictionary<string, string>? Metadata { get; set; }

    // For easy smoke-testing: allow passing an explicit creator ID.
    // In production you’ll read this from the auth claims instead.
    public int? CreatedByUserId { get; set; }
}