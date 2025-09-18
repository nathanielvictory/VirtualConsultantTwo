from pydantic_ai.usage import RunUsage
from pydantic_ai.exceptions import UsageLimitExceeded
from pydantic_ai.exceptions import UnexpectedModelBehavior
from botocore.exceptions import ClientError

from service.data.datasource import ReportingSurveyDataSource

from .insight_agent import insight_agent, InsightDependencies, InsightOutput
from .focus_agent import focus_agent, FocusDependencies, FocusOutput


class SurveyToInsightsAgent:
    def __init__(self, kbid, key_number):
        self.datasource = ReportingSurveyDataSource(kbid=kbid, key_number=key_number)
        self.usage = RunUsage()


    def reset_usage(self):
        old_usage = self.usage
        self.usage = RunUsage()
        return old_usage


    def _get_focuses(self, max_focus_count=3) -> list[str]:
        focus_deps = FocusDependencies(
            all_question_text=self.datasource.all_question_text(),
        )
        focus_prompt = f"Please generate up to {max_focus_count} focuses for me."
        output: FocusOutput | None = self._run_agent(focus_prompt, focus_agent, focus_deps)
        if not output:
            return []
        return output.focuses


    def get_insights(self, focuses: list[str] = None, insights_per_focus: int = 3) -> list[str]:
        if not focuses:
            focuses = self._get_focuses()
        all_insights = []
        for focus in focuses:
            total = 1
            for i in range(insights_per_focus):
                insight_deps = InsightDependencies(
                    datasource=self.datasource,
                    existing_insights=all_insights
                )
                prompt = f"Please focus on the following for me:\n{focus}"
                output: InsightOutput | None = self._run_agent(prompt, insight_agent, insight_deps)
                if not output:
                    continue
                all_insights.append(output.main_insight)
                if output.optional_insight_one:
                    all_insights.append(output.optional_insight_one)
                    total += 1
                if output.optional_insight_two:
                    all_insights.append(output.optional_insight_two)
                    total += 1
        return all_insights


    # TODO flag usage limits here
    def _run_agent(self, prompt, agent, deps, retries=2):
        self.usage.requests = 0
        attempts = 0
        while True:
            try:
                result = agent.run_sync(
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
