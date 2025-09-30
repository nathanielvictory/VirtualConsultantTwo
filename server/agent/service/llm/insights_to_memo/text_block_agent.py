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
    default_prompt: str


class TextOutput(BaseModel):
    descriptive_text: str = Field(description="Full text block with inserted statistics")


text_block_agent = Agent(
    model,
    deps_type=TextBlockDependencies,
    output_type=TextOutput,
)


@text_block_agent.system_prompt
async def append_data_to_prompt(ctx: RunContext[TextBlockDependencies]) -> str:
    append_string = ctx.deps.default_prompt
    append_string += f"\nThe question text for the survey is as follows:\n"
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
