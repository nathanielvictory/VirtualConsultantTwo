from pydantic_ai.usage import RunUsage
from pydantic_ai.exceptions import UnexpectedModelBehavior
from botocore.exceptions import ClientError

from service.data.datasource import ReportingSurveyDataSource
from service.docs.memo_creator import MemoCreator

from .text_block_agent import text_block_agent, TextBlockDependencies, TextOutput
from .memo_agent import memo_agent, MemoDependencies, MemoOutput
from ..interfaces import ProgressCallback


class InsightsToMemoAgent:
    def __init__(self, kbid, key_number, memo_doc_id, progress_callback: ProgressCallback = None):
        self.datasource = ReportingSurveyDataSource(kbid=kbid, key_number=key_number)
        self.memo_creator = MemoCreator(memo_doc_id)
        self.usage = RunUsage()
        self.progress_callback = progress_callback


    # TODO place requested usage limits here
    def create_memo_from_insights(self, insights, focus: str = None):
        if self.progress_callback:
            self.progress_callback.reset_progress_total(len(insights) + 1)
        self.progress_callback.increment_progress()
        text_block_outputs: list[str] = []
        for insight in insights:
            text_block_deps = TextBlockDependencies(
                insight=insight,
                datasource=self.datasource,
            )
            response: TextOutput | None = self._run_agent("Try to keep the writing simple and actionable.", text_block_agent, text_block_deps)
            if self.progress_callback:
                self.progress_callback.increment_progress()
            if response is None:
                continue
            text_block_outputs.append(response.descriptive_text)

        report_blocks_text = '\n\n'.join(text_block_outputs)
        report_text = self._merge_report_blocks(report_blocks_text, focus)
        if self.progress_callback:
            self.progress_callback.increment_progress()
        self.memo_creator.append_text(report_text)


    def _merge_report_blocks(self, report_blocks_text, focus):
        memo_deps = MemoDependencies(
            memo_focus=focus,
        )
        response: MemoOutput = self._run_agent(report_blocks_text, memo_agent,  memo_deps)
        if not response:
            raise Exception(f"AI Agent failed to generate a report")
        return response.full_report


    # TODO flag usage limits here
    def _run_agent(self, prompt, agent, deps, retries=3):
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
