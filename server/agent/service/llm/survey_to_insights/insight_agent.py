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


class InsightOutput(BaseModel):
    main_insight: str = Field(description="Primary quality insight")
    optional_insight_one: Optional[str] = Field(default=None, description="First optional supporting insight")
    optional_insight_two: Optional[str] = Field(default=None, description="Second optional supporting insight")


system_prompt = (
    "You're working for a consultant who needs help generating meaningful insights into the results of a survey. "
    "Your goal is to help your client generate actionable insights into the results of a survey. "
    "You should keep them short and to the point but make sure they're actionable. Try not to repeat yourself. "
    "Key things to look into include major demographics and differences in crosstabs between them. "
    "Feel free to look through as much data as you need to generate a quality insight, "
    "you can request topline and crosstab survey data as needed. "
    "Unfortunately you're on your own and cannot ask for help since you're the only one with the knowledge "
    "to generate these insights for the client. We want the insights to be actionable so focus on finding "
    "disparities that things like targeted outreach can shore up. An example would be that independents "
    "have no opinion or have never heard of a candidate or that young people find an issue disproportionately "
    "unpopular. Please keep insights contained to a single topic and one line of text only while "
    "including the short names of the questions these conclusions are drawn from. If you have lesser insights feel free "
    "to provide up to three but your main goal is to provide one quality insight. The client will optionally provide a focus for "
    "your insights to look into. "
)


insight_agent = Agent(
    model,
    deps_type=InsightDependencies,
    output_type=InsightOutput,
    system_prompt=system_prompt,
)


@insight_agent.system_prompt
async def append_data_to_prompt(ctx: RunContext[InsightDependencies]) -> str:
    append_string = f"\nThe topline results for the survey are as follows:\n"
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
        print(f"LLM requested topline for {short_name}")
        topline_data = ctx.deps.datasource.topline_text(short_name)
        return topline_data
    except KeyError:
        print(f"No topline for {short_name}")
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
        print(f"LLM requested crosstab for {short_name} x {by_short_name}")
        crosstab_data = ctx.deps.datasource.crosstab_text(short_name, by_short_name)
        return crosstab_data
    except KeyError:
        print(f"No crosstab for {short_name} x {by_short_name}")
        return "I couldn't find the crosstab with those short names."
