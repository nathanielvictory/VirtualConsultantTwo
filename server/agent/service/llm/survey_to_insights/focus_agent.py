from pydantic_ai import Agent, RunContext
from dataclasses import dataclass
from pydantic import BaseModel, Field

from ..base import model


@dataclass
class FocusDependencies:
    all_question_text: str
    default_prompt: str

class FocusOutput(BaseModel):
    focuses: list[str] = Field(description="List of focuses", min_length=1, max_length=10)


focus_agent = Agent(
    model,
    deps_type=FocusDependencies,
    output_type=FocusOutput
)


@focus_agent.system_prompt
async def append_data_to_prompt(ctx: RunContext[FocusDependencies]) -> str:
    append_string = ctx.deps.default_prompt
    append_string += f"\nThe full question text for the survey is as follows:\n"
    append_string += ctx.deps.all_question_text

    return append_string.strip()
