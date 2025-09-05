from pydantic_ai import Agent, RunContext
from dataclasses import dataclass
from pydantic import BaseModel, Field
from typing import Optional

from ..base import model

@dataclass
class SlideDependencies:
    all_question_text: str


class SlideSpecification(BaseModel):
    title: Optional[str] = Field(default="", description="Optional Title for the slide")
    bullet_points: Optional[list[str]] = Field(default=[], description="Optional list of bullet points for the slide")
    charts: Optional[list[str]] = Field(default=[], description="Optional list of charts for the slide")


system_prompt = (
    "You work for a political consultant who has outlined a powerpoint for you to make. "
    "You'll be given a description of the powerpoint slide that you need to make and a copy of the original survey "
    "to reference in adding charts. "
    "Some slide guidelines to keep in mind: \n"
    " - Slides can have titles, bullet points, or charts in any combination \n"
    " - Try to put stats and data point into charts instead of bullets \n"
    " - Bullets should be simple and defer dense stats to charts \n"
    " - Aim for minimalism, the slides augment the memo they don't replace it \n"
    " - Try to keep text short but descriptive \n"
    " - Charts can contain topline or crosstab data \n"
    " - When describing a chart, please reference the data required by the shortened question name in the original survey "
    " ie 'bar chart displaying Q17 Informed Ballot' or 'stacked column chart showing Q4 Gender by Zip Code' \n"
    " - Chart requests need to be simple and state specific questions by name \n"
)


slide_agent = Agent(
    model,
    deps_type=SlideDependencies,
    output_type=SlideSpecification,
    system_prompt=system_prompt,
)


@slide_agent.system_prompt
async def add_topline_to_prompt(ctx: RunContext[SlideDependencies]):
    return f"\nHere is the full survey text:\n{ctx.deps.all_question_text}"
