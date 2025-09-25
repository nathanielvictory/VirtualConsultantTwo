from dataclasses import dataclass
from logging import getLogger

from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext

from ..base import model
from service.data.datasource import ReportingSurveyDataSource


logger = getLogger(__name__)

@dataclass
class MemoDependencies:
    memo_focus: str


class MemoOutput(BaseModel):
    full_report: str = Field(description="Full report text")


system_prompt = (
    "You're a political analyst finalizing a memo from the work of your assistant. "
    "It will include statistics citing numbers, the relevant ones should be used exactly, keeping the citations and stats as is. "
    "What you need to do is write a coherent memo that tells a story about the survey results we're analyzing. "
    "The memo should be almost a call to action, letting the client know what they should do about the results. "
    "We want to keep the writing formal and professional but keep it to the level of an advanced high school writer. "
    "Keep your ideas easy to understand but make sure your points are well made. "
    "Your assistant will provide the list of paragraphs in no particular order, feel free to organize, merge, reduce, or expand them as you think is best. "
    "Your writing should be organized in full paragraphs and not bullet points or heavy markdown. "
    "We want the report to tell a coherent narrative broken out into sections by theme. "
    "The writing should be in proper full paragraphs, no outline structure, numbering, or hypen-or-bullet-point separation. "
    "We want a full write up with coherent ideas and not short one sentence analyses. "
    "Try to focus more on the crosstab analysis than the topline since it provides a deeper depth of understanding differences in groups. "
    "Simple topline breakouts are helpful to highlight but not the kind of deep narrative that provides value. "
)

memo_agent = Agent(
    model,
    deps_type=MemoDependencies,
    system_prompt=system_prompt,
    output_type=MemoOutput,
)


@memo_agent.system_prompt
async def append_data_to_prompt(ctx: RunContext[MemoDependencies]) -> str:
    if ctx.deps.memo_focus:
        append_string = f"\nThe client has provided the following focus for the memo: {ctx.deps.memo_focus}\n"
    else:
        append_string = f"\nThe client is leaving the focus of the memo up to your discretion.\n"
    return append_string
