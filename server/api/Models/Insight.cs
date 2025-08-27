namespace api.Models;

public enum InsightSource { Llm, User }
public class Insight
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Content { get; set; } = string.Empty;
    public InsightSource Source { get; set; } = InsightSource.Llm;
    public int OrderIndex { get; set; }
    
    public Project? Project { get; set; }
}