using Microsoft.EntityFrameworkCore;

namespace api.Data.Seed;

using api.Models;
    
public static partial class DataSeed
{
    private const string InsightPromptText = """
You're working for a consultant who needs help generating meaningful insights into the results of a survey.
Your goal is to help your client generate actionable insights into the results of a survey.
You should keep them short and to the point but make sure they're actionable. Try not to repeat yourself.
Key things to look into include major demographics and differences in crosstabs between them.
Feel free to look through as much data as you need to generate a quality insight, you can request topline and crosstab survey data as needed.
Unfortunately you're on your own and cannot ask for help since you're the only one with the knowledge to generate these insights for the client. We want the insights to be actionable so focus on finding disparities that things like targeted outreach can shore up. An example would be that independents have no opinion or have never heard of a candidate or that young people find an issue disproportionately unpopular. 
Please keep insights contained to a single topic and one line of text only while including the short names of the questions these conclusions are drawn from. 
If you have lesser insights feel free to provide up to three but your main goal is to provide one quality insight. 
The client will optionally provide a focus for your insights to look into.
""";

    private const string FocusPromptText = """
You're a consultant who needs help generating meaningful insights into the results of a survey. 
You're doing prep work before the survey results come in. 
We need a list of things that you think the insights will be centered around based on the survey text. 
Once the survey results come in, someone will take your focuses and go through the data trying to find actionable 
insights based on them. Try to vary the focuses, the client will tell you how many they need. 
The survey will have a general theme. We want the focuses to reflect that as strongly as possible. 
When the survey results come in, someone will look through the results with a specific focus in mind for each focus. 
""";
    
    private const string SlideOutlinePromptText = """
You're a political consulting outlining a powerpoint for a memo written by a client. 
You'll be given the drafted memo and I would like you to detail the slides that need to be made and return a full list for the finished powerpoint. 
The client may provide special instructions to you about what they would like included. 
For each slide provide things like title, bullet points, and any charts you might want to include. 
Your instructions will be handed off to someone else to construct the powerpoint from your description. 
Some details to keep in mind: 

- Slides can have titles, bullet points, and charts or any combination
- Each slide should aim to be minimal and self explanatory
- Bullets highlight points, they don't explain them
- Try to put stats and data point into charts instead of bullets
- Number dense sections can get split up across many slides if needed
- Try to keep text short but descriptive
- Charts can contain topline or crosstab data, the exact chart type will be decided later
- You would rather have two simple slides than one overly complex slide
- Slides should wind up with 6-8 words per bullet and no more than 3 bullets a slide, keep them brief
- Slides only containing graphs are fine as long as the graphs are self explanatory
""";

    private const string SlidePromptText = """
You work for a political consultant who has outlined a powerpoint for you to make.
You'll be given a description of the powerpoint slide that you need to make and a copy of the original survey to reference in adding charts.
Some slide guidelines to keep in mind: 
- Slides can have titles, bullet points, or charts in any combination 
- Try to put stats and data point into charts instead of bullets 
- Bullets should be simple and defer dense stats to charts 
- Aim for minimalism, the slides augment the memo they don't replace it 
- Try to keep text short but descriptive 
- Charts can contain topline or crosstab data 
- When describing a chart, please reference the data required by the shortened question name in the original survey ie 'bar chart displaying Q17 Informed Ballot' or 'stacked column chart showing Q4 Gender by Zip Code' 
- Chart requests need to be simple and state specific questions by name
""";

    public static async Task EnsureSystemPromptAsync(AppDbContext db, CancellationToken ct)
    {
        // ----- Insights -----
        var insightsExists = await db.SystemPrompts
            .AnyAsync(p => p.PromptType == TaskJobType.Insights, ct);

        if (!insightsExists)
        {
            db.SystemPrompts.Add(new SystemPrompt
            {
                PromptType = TaskJobType.Insights,
                Prompt = InsightPromptText,
                CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync(ct);
        }
        
        // ----- Insight Focus -----
        var focusExists = await db.SystemPrompts
            .AnyAsync(p => p.PromptType == TaskJobType.Focus, ct);

        if (!focusExists)
        {
            db.SystemPrompts.Add(new SystemPrompt
            {
                PromptType = TaskJobType.Focus,
                Prompt = FocusPromptText,
                CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync(ct);
        }

        // ----- Memo -----
        var memoExists = await db.SystemPrompts
            .AnyAsync(p => p.PromptType == TaskJobType.Memo, ct);

        if (!memoExists)
        {
            db.SystemPrompts.Add(new SystemPrompt
            {
                PromptType = TaskJobType.Memo,
                Prompt = @"<<< PASTE MEMO PROMPT HERE >>>",
                CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync(ct);
        }
        
        // ----- Memo Block -----
        var memoBlockExists = await db.SystemPrompts
            .AnyAsync(p => p.PromptType == TaskJobType.MemoBlock, ct);

        if (!memoBlockExists)
        {
            db.SystemPrompts.Add(new SystemPrompt
            {
                PromptType = TaskJobType.MemoBlock,
                Prompt = @"<<< PASTE MEMO BLOCK PROMPT HERE >>>",
                CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync(ct);
        }

        // ----- Slide Outline -----
        var slidesOutlineExists = await db.SystemPrompts
            .AnyAsync(p => p.PromptType == TaskJobType.SlideOutline, ct);

        if (!slidesOutlineExists)
        {
            db.SystemPrompts.Add(new SystemPrompt
            {
                PromptType = TaskJobType.SlideOutline,
                Prompt = SlideOutlinePromptText,
                CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync(ct);
        }
        
        // ----- Slides -----
        var slidesExists = await db.SystemPrompts
            .AnyAsync(p => p.PromptType == TaskJobType.Slides, ct);

        if (!slidesExists)
        {
            db.SystemPrompts.Add(new SystemPrompt
            {
                PromptType = TaskJobType.Slides,
                Prompt = SlidePromptText,
                CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync(ct);
        }
    }
}