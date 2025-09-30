from pydantic_ai.usage import RunUsage
from pydantic_ai.exceptions import UnexpectedModelBehavior
from botocore.exceptions import ClientError

from service.data.datasource import ReportingSurveyDataSource
from service.slides.chartkit import ChartCreator, ChartRequest, CrosstabSpec, ToplineSpec
from service.slides.slidekit import SlideCreator
from service.docs.memo_creator import MemoCreator

from .slide_outline_agent import slide_outline_agent, PowerpointOutline, SlideOutlineDependencies
from .slide_agent import slide_agent, SlideDependencies
from .chart_agent import chart_agent, ChartSpecification, ChartDependencies
from ..interfaces import ProgressCallback

SLIDE_AGENT_DEFAULT_PROMPT = (
    "You work for a political consultant who has outlined a powerpoint for you to make. "
    "You'll be given a description of the powerpoint slide that you need to make and a copy of the original survey "
    "to reference in adding charts. "
    "Some slide guidelines to keep in mind: \n"
    " - Slides can have titles, bullet points, or charts in any combination \n"
    " - Try to put stats and data point into charts instead of bullets \n"
    " - Bullets should be simple and defer dense stats to charts \n"
    " - Aim for minimalism, the slides augment the memo they don't replace it \n"
    " - Try to keep text short but descriptive \n"
    " - Charts can contain topline or crosstab data \n"
    " - When describing a chart, please reference the data required by the shortened question name in the original survey "
    " ie 'bar chart displaying Q17 Informed Ballot' or 'stacked column chart showing Q4 Gender by Zip Code' \n"
    " - Chart requests need to be simple and state specific questions by name \n"
)

SLIDE_AGENT_OUTLINE_DEFAULT_PROMPT = (
    "You're a political consulting outlining a powerpoint for a memo written by a client. "
    "You'll be given the drafted memo and I would like you to detail the slides that need to be made and "
    "return a full list for the finished powerpoint. The client may provide special instructions to you "
    "about what they would like included. For each slide provide things like title, bullet points, and "
    "any charts you might want to include. Your instructions will be handed off to someone else to construct "
    "the powerpoint from your description. Some details to keep in mind: \n"
    " - Slides can have titles, bullet points, and charts or any combination"
    " - Each slide should aim to be minimal and self explanatory \n"
    " - Bullets highlight points, they don't explain them \n"
    " - Try to put stats and data point into charts instead of bullets \n"
    " - Number dense sections can get split up across many slides if needed \n"
    " - Try to keep text short but descriptive \n"
    " - Charts can contain topline or crosstab data, the exact chart type will be decided later \n"
    " - You would rather have two simple slides than one overly complex slide \n"
    " - Slides should wind up with 6-8 words per bullet and no more than 3 bullets a slide, keep them brief \n"
    " - Slides only containing graphs are fine as long as the graphs are self explanatory \n"
)

class MemoToSlidesAgent:
    def __init__(
            self,
            kbid,
            key_number,
            memo_doc_id,
            slides_id,
            sheets_id,
            progress_callback: ProgressCallback = None,
            slide_agent_prompt: str = None,
            slide_outline_agent_prompt: str = None
    ):
        self.datasource = ReportingSurveyDataSource(kbid=kbid, key_number=key_number)
        self.memo_creator = MemoCreator(memo_doc_id)
        self.memo = self.memo_creator.read_all_text()
        self.chart_creator = ChartCreator(spreadsheet_id=sheets_id, data=self.datasource)
        self.slide_creator = SlideCreator(presentation_id=slides_id)
        self.progress_callback = progress_callback
        self.usage = RunUsage()
        self.slide_agent_prompt = slide_agent_prompt if slide_agent_prompt else SLIDE_AGENT_DEFAULT_PROMPT
        self.slide_outline_agent_prompt = slide_outline_agent_prompt if slide_outline_agent_prompt else SLIDE_AGENT_OUTLINE_DEFAULT_PROMPT


    # TODO place requested usage limits here
    def create_slides_from_memo(self, outline_focus: str = None):
        outline = self._get_outline(outline_focus)

        self.progress_callback.reset_progress_total(len(outline.slides))
        for slide_description in outline.slides:
            self._add_slide(slide_description)
            self.progress_callback.increment_progress()
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
            all_question_text=self.datasource.all_question_text(),
            default_prompt=self.slide_outline_agent_prompt,
        )
        output = self._run_agent(focus, slide_outline_agent, outline_deps)
        return output


    def _add_slide(self, slide_description: str):
        slide_deps = SlideDependencies(
            all_question_text=self.datasource.all_question_text(),
            default_prompt=self.slide_agent_prompt,
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
