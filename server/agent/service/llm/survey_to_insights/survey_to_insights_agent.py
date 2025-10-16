from pydantic_ai.usage import RunUsage
from pydantic_ai.exceptions import UsageLimitExceeded
from pydantic_ai.exceptions import UnexpectedModelBehavior
from botocore.exceptions import ClientError

from service.data.datasource import ReportingSurveyDataSource

from .insight_agent import insight_agent, InsightDependencies, InsightOutput
from .focus_agent import focus_agent, FocusDependencies, FocusOutput
from ..interfaces import ProgressCallback

DEFAULT_FOCUS_AGENT_PROMPT = (
    "You're a consultant who needs help generating meaningful insights into the results of a survey. "
    "You're doing prep work before the survey results come in. "
    "We need a list of things that you think the insights will be centered around based on the survey text. "
    "Once the survey results come in, someone will take your focuses and go through the data trying to find actionable "
    "insights based on them. Try to vary the focuses, the client will tell you how many they need. "
    "The survey will have a general theme. We want the focuses to reflect that as strongly as possible. "
    "When the survey results come in, someone will look through the results with a specific focus in mind for each focus. "
)

DEFAULT_INSIGHT_AGENT_PROMPT = (
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
    "including the short names of the questions these conclusions are drawn from. The client will optionally provide a focus for "
    "your insights to look into. "
)

class SurveyToInsightsAgent:
    def __init__(
            self,
            kbid: str,
            key_number: int, progress_callback: ProgressCallback = None,
            focus_agent_prompt: str = None,
            insight_agent_prompt: str = None,
            project_context: str = None
    ):
        self.datasource = ReportingSurveyDataSource(kbid=kbid, key_number=key_number)
        self.usage = RunUsage()
        self.progress_callback = progress_callback
        self.focus_agent_prompt = self._add_context(focus_agent_prompt if focus_agent_prompt else DEFAULT_FOCUS_AGENT_PROMPT, project_context)
        self.insight_agent_prompt = self._add_context(insight_agent_prompt if insight_agent_prompt else DEFAULT_INSIGHT_AGENT_PROMPT, project_context)

    def _add_context(self, prompt, context):
        if context:
            return prompt + f"\n\nHere is some additional context for the project:\n{context}"
        return prompt

    def reset_usage(self):
        old_usage = self.usage
        self.usage = RunUsage()
        return old_usage


    async def _get_focuses(self, max_focus_count=3) -> list[str]:
        focus_deps = FocusDependencies(
            all_question_text=self.datasource.all_question_text(),
            default_prompt=self.focus_agent_prompt
        )
        focus_prompt = f"Please generate up to {max_focus_count} focuses for me."
        output: FocusOutput | None = await self._run_agent(focus_prompt, focus_agent, focus_deps, retries=10)
        if self.progress_callback:
            self.progress_callback.increment_progress()
        if not output:
            return []
        return output.focuses


    async def get_insights(self, focuses: list[str] = None, insights_per_focus: int = 3) -> list[str]:
        if self.progress_callback:
            self.progress_callback.reset_progress_total((3 if focuses is None else len(focuses)) * insights_per_focus)

        if not focuses:
            focuses = await self._get_focuses()
        all_insights = []
        for focus in focuses:
            for i in range(insights_per_focus):
                insight_deps = InsightDependencies(
                    datasource=self.datasource,
                    existing_insights=all_insights,
                    default_prompt=self.insight_agent_prompt
                )
                prompt = f"Please focus on the following for me:\n{focus}"
                output: InsightOutput | None = await self._run_agent(prompt, insight_agent, insight_deps)
                if self.progress_callback:
                    self.progress_callback.increment_progress()
                if not output:
                    continue
                all_insights.append(output.new_insight)
        return all_insights


    async def _run_agent(self, prompt, agent, deps, retries=2):
        self.usage.requests = 0
        attempts = 0
        while True:
            try:
                result = await agent.run(
                    prompt,
                    deps=deps,
                    usage=self.usage
                )
                return result.output
            except (UnexpectedModelBehavior, ClientError) as e:
                attempts += 1
                if attempts >= retries:
                    return None
            except UsageLimitExceeded:
                return None
