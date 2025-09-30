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
    default_prompt: str

class MemoOutput(BaseModel):
    full_report: str = Field(description="Full report text")


memo_agent = Agent(
    model,
    deps_type=MemoDependencies,
    output_type=MemoOutput,
)


@memo_agent.system_prompt
async def append_data_to_prompt(ctx: RunContext[MemoDependencies]) -> str:
    append_string = ctx.deps.default_prompt
    if ctx.deps.memo_focus:
        append_string += f"\nThe client has provided the following focus for the memo: {ctx.deps.memo_focus}\n"
    else:
        append_string += f"\nThe client is leaving the focus of the memo up to your discretion.\n"
    return append_string
