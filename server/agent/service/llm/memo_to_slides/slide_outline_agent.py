from pydantic_ai import Agent, RunContext
from dataclasses import dataclass
from pydantic import BaseModel, Field


from ..base import model


@dataclass
class SlideOutlineDependencies:
    memo: str
    all_question_text: str


class PowerpointOutline(BaseModel):
    slides: list[str] = Field(description="List of included powerpoint slides")

system_prompt = (
    "You're a political consulting outlining a powerpoint for a memo written by a client. "
    "You'll be given the drafted memo and I would like you to detail the slides that need to be made and "
    "return a full list for the finished powerpoint. The client may provide special instructions to you "
    "about what they would like included. For each slide provide things like title, bullet points, and "
    "any charts you might want to include. Your instructions will be handed off to someone else to construct "
    "the powerpoint from your description. Some details to keep in mind: \n"
    " - Slides can have titles, bullet points, and charts or any combination"
    " - Each slide should aim to be minimal and self explanatory \n"
    " - Bullets highlight points, they don't explain them \n"
    " - Try to put stats and data point into charts instead of bullets \n"
    " - Number dense sections can get split up across many slides if needed \n"
    " - Try to keep text short but descriptive \n"
    " - Charts can contain topline or crosstab data, the exact chart type will be decided later \n"
    " - You would rather have two simple slides than one overly complex slide \n"
    " - Slides should wind up with 6-8 words per bullet and no more than 3 bullets a slide, keep them brief \n"
    " - Slides only containing graphs are fine as long as the graphs are self explanatory \n"
)


slide_outline_agent = Agent(
    model,
    deps_type=SlideOutlineDependencies,
    output_type=PowerpointOutline,
    system_prompt=system_prompt,
)

@slide_outline_agent.system_prompt
async def add_memo_to_prompt(ctx: RunContext[SlideOutlineDependencies]):
    return f"\nHere is the full memo:\n{ctx.deps.memo}"


@slide_outline_agent.system_prompt
async def add_topline_to_prompt(ctx: RunContext[SlideOutlineDependencies]):
    return f"\nFor reference, here is the conducted survey:\n{ctx.deps.all_question_text}"
