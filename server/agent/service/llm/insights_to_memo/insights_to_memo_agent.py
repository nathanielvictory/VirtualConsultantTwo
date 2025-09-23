from pydantic_ai.usage import RunUsage
from pydantic_ai.exceptions import UnexpectedModelBehavior
from botocore.exceptions import ClientError

from service.data.datasource import ReportingSurveyDataSource
from service.docs.memo_creator import MemoCreator



class MemoToSlidesAgent:
    def __init__(self, kbid, key_number, memo_doc_id):
        self.datasource = ReportingSurveyDataSource(kbid=kbid, key_number=key_number)
        self.memo_creator = MemoCreator(memo_doc_id)
        self.usage = RunUsage()


    # TODO place requested usage limits here
    def create_slides_from_memo(self, outline_focus: str = None):
        outline = self._get_outline(outline_focus)
        for slide_description in outline.slides:
            self.add_slide(slide_description)

        return self.usage


    def reset_usage(self):
        old_usage = self.usage
        self.usage = RunUsage()
        return old_usage


    def _get_outline(self, focus: str = None) -> PowerpointOutline:
        if not focus:
            focus = "The client has provided no additional instruction."

        outline_deps = SlideOutlineDependencies(
            memo=self.memo,
            all_question_text=self.datasource.all_question_text()
        )
        output = self._run_agent(focus, slide_outline_agent, outline_deps)
        return output


    def add_slide(self, slide_description: str):
        slide_deps = SlideDependencies(
            all_question_text=self.datasource.all_question_text()
        )
        slide_spec = self._run_agent(slide_description, slide_agent, slide_deps)
        if not slide_spec:
            return self.usage

        if slide_spec.title:
            self.slide_creator.add_title(slide_spec.title)
        if slide_spec.bullet_points:
            for bullet_point in slide_spec.bullet_points:
                self.slide_creator.add_bullet(bullet_point)

        if slide_spec.charts:
            for chart in slide_spec.charts:
                self._add_chart(chart)
        self.slide_creator.create_slide()
        return self.usage


    def _add_chart(self, chart_description):
        chart_deps = ChartDependencies(all_toplines_text=self.datasource.all_question_text())
        chart_spec: ChartSpecification = self._run_agent(chart_description, chart_agent, chart_deps)
        if not chart_spec:
            return

        if chart_spec.crosstab_shortened_name:
            dataset_spec = CrosstabSpec(
                varname=chart_spec.shortened_name,
                by_varname=chart_spec.crosstab_shortened_name,
            )
        else:
            dataset_spec = ToplineSpec(
                varname=chart_spec.shortened_name
            )
        chart_request = ChartRequest(
            title=chart_spec.title,
            kind=chart_spec.kind,
            dataset=dataset_spec,
        )
        chart_ref = self.chart_creator.render(chart_request)
        if chart_ref:
            self.slide_creator.add_chart(spreadsheet_id=chart_ref.spreadsheet_id, chart_id=chart_ref.chart_id)


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
