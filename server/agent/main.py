from server.agent.service.slides.slidekit import SlideCreator, Title, Bullets, SheetsChart



from service.slides.chartkit.chart_creator import ChartCreator
from service.slides.chartkit.specs import ToplineSpec, CrosstabSpec
from service.slides.chartkit.models import ChartKind, ChartRequest


PRESENTATION_ID = '1xXayw9SkskXMQ8hO828sxz1BNdttoTcT7eXsOs78ADI'
SHEETS_ID = '1US9PKrFlIZI-44lA7zZtfaWQoCSjVPOrfSCXQlwycXg'


def main():
    chart_creator = ChartCreator(spreadsheet_id=SHEETS_ID)
    slide_creator = SlideCreator(presentation_id=PRESENTATION_ID)

    crosstab_chart = chart_creator.render(ChartRequest(
        title="Trump Image x Gender",
        dataset=CrosstabSpec(varname="TRUMP_IMAGE", by_varname="GENDER"),
        kind=ChartKind.PIE,
        sheet_name="TRUMP_X_GENDER",
    ))

    topline_chart = chart_creator.render(ChartRequest(
        title="Trump Image - Topline",
        dataset=ToplineSpec(varname="TRUMP_IMAGE"),
        kind=ChartKind.PIE,
        sheet_name="TRUMP_TOPLINE",
    ))

    slide_creator.add_chart(crosstab_chart.spreadsheet_id, crosstab_chart.chart_id)
    slide_creator.add_chart(topline_chart.spreadsheet_id, topline_chart.chart_id)
    slide_creator.add_title("Title four bullets 2 pie charts")
    for i in range(4):
        slide_creator.add_bullet(f"{i} bullet two charts")
    slide_creator.create_slide()

    if True:
        pass


if __name__ == '__main__':
    main()