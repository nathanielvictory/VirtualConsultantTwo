from pydantic_ai import Agent, RunContext
from dataclasses import dataclass
from typing import Optional
from pydantic import BaseModel, Field
from logging import getLogger

from ..base import model

from service.data.datasource import ReportingSurveyDataSource

logger = getLogger(__name__)

@dataclass
class InsightDependencies:
    datasource: ReportingSurveyDataSource
    existing_insights: Optional[list[str]]
    default_prompt: str


class InsightOutput(BaseModel):
    new_insight: str = Field(description="Single concise insight into survey results")


insight_agent = Agent(
    model,
    deps_type=InsightDependencies,
    output_type=InsightOutput,
)


@insight_agent.system_prompt
async def append_data_to_prompt(ctx: RunContext[InsightDependencies]) -> str:
    append_string = ctx.deps.default_prompt
    append_string += f"\nThe topline results for the survey are as follows:\n"
    append_string += ctx.deps.datasource.all_toplines_text()

    if ctx.deps.existing_insights:
        append_string += "You have already found the following insights:\n"
        append_string += '\n'.join(ctx.deps.existing_insights)
        append_string += '\n\n'

    return append_string.strip()


@insight_agent.tool
async def get_topline_data(ctx: RunContext[InsightDependencies], short_name: str) -> str:
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


@insight_agent.tool
async def get_crosstab_data(ctx: RunContext[InsightDependencies], short_name: str, by_short_name: str) -> str:
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
