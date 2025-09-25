from typing import Optional
from dataclasses import dataclass
from logging import getLogger

from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext

from ..base import model
from service.data.datasource import ReportingSurveyDataSource


logger = getLogger(__name__)

@dataclass
class TextBlockDependencies:
    datasource: ReportingSurveyDataSource
    insight: str


class TextOutput(BaseModel):
    descriptive_text: str = Field(description="Full text block with inserted statistics")


system_prompt = (
    "You're a consultant finalizing a report from your outline. "
    "Your goal is to help your client with the process of writing a memo. "
    "I want you to take the insight that you wrote and add in the relevant numerical data from the survey "
    "that this report is based on. We have crosstab and topline data available to highlight key differences as needed. "
    "The finished text should be three to five sentences in length. Speak precisely and avoid the use of pronouns or first person language. "
    "If your paragraph references percentages please add them in exactly. This will be for the final version of this report. "
    "The aim is to provide a specific and meaningful interpretation of the survey data in a way that wouldn't be obvious to the average person. "
    "For each statistic added to the report please reference the question short names the data came from for easy cross referencing. "
    # "Don't trust the listed numbers, we want you to double check and confirm the numbers by requesting the topline and crosstab data directly. "
    "We want to keep an emphasis on crosstab data where possible since the simpler topline values don't bring as much value to the client. "
    "When an insight focuses on the intersection of two questions please make sure to pull that focus through to the text. "
)

text_block_agent = Agent(
    model,
    deps_type=TextBlockDependencies,
    system_prompt=system_prompt,
    output_type=TextOutput,
)


@text_block_agent.system_prompt
async def append_data_to_prompt(ctx: RunContext[TextBlockDependencies]) -> str:
    append_string = f"\nThe topline results for the survey are as follows:\n"
    append_string += ctx.deps.datasource.all_question_text()

    return append_string.strip()


@text_block_agent.tool
async def get_topline_data(ctx: RunContext[TextBlockDependencies], short_name: str) -> str:
    """
        Retrieves the topline survey results based on the question identifier.

        Args:
            short_name (str): The short name (identifier) for the question.
        Returns:
            str: A formatted string representation of the topline results.
        """
    try:
        logger.info(f"LLM requested topline for {short_name}")
        topline_data = ctx.deps.datasource.topline_text(short_name)
        return topline_data
    except KeyError:
        logger.info(f"No topline for {short_name}")
        return "I couldn't find any question with that short name."


@text_block_agent.tool
async def get_crosstab_data(ctx: RunContext[TextBlockDependencies], short_name: str, by_short_name: str) -> str:
    """
        Retrieves the crosstabulated survey results based on the provided question short names.

        Args:
            short_name (str): The short name (identifier) for the vertical axis question.
            by_short_name (str): The short name (identifier) for the horizontal axis question.

        Returns:
            str: A formatted string representation of the crosstab results.
    """
    try:
        logger.info(f"LLM requested crosstab for {short_name} x {by_short_name}")
        crosstab_data = ctx.deps.datasource.crosstab_text(short_name, by_short_name)
        return crosstab_data
    except KeyError:
        logger.info(f"No crosstab for {short_name} x {by_short_name}")
        return "I couldn't find the crosstab with those short names."
