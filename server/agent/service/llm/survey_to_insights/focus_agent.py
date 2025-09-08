from pydantic_ai import Agent, RunContext
from dataclasses import dataclass
from pydantic import BaseModel, Field

from ..base import model


@dataclass
class FocusDependencies:
    all_question_text: str


class FocusOutput(BaseModel):
    focuses: list[str] = Field(description="List of focuses", min_length=1, max_length=10)


system_prompt = (
    "You're working for a consultant who needs help generating meaningful insights into the results of a survey. "
    "You're doing prep work before the survey results come in. "
    "We need a list of things that you think the insights will be centered around based on the survey text. "
    "Once the survey results come in, someone will take your focuses and go through the data trying to find actionable "
    "insights based on them. Try to vary the focuses, the client will tell you how many they need. "
    "The survey will have a general theme. We want the focuses to reflect that as strongly as possible. "
)


focus_agent = Agent(
    model,
    deps_type=FocusDependencies,
    output_type=FocusOutput,
    system_prompt=system_prompt,
)


@focus_agent.system_prompt
async def append_data_to_prompt(ctx: RunContext[FocusDependencies]) -> str:
    append_string = f"\nThe full question text for the survey is as follows:\n"
    append_string += ctx.deps.all_question_text

    return append_string.strip()
