from service.slides.slidekit import SlideCreator, Title, Bullets, SheetsChart


from service.data.datasource import ReportingSurveyDataSource
from service.slides.chartkit.chart_creator import ChartCreator
from service.slides.chartkit.specs import ToplineSpec, CrosstabSpec
from service.slides.chartkit.models import ChartKind, ChartRequest

KBID = 'reczmSWIH1WnOJ7VH'
KEY_NUMBER = 0

PRESENTATION_ID = '1xXayw9SkskXMQ8hO828sxz1BNdttoTcT7eXsOs78ADI'
SHEETS_ID = '1US9PKrFlIZI-44lA7zZtfaWQoCSjVPOrfSCXQlwycXg'
DOC_ID = '1R3iFZdvb-EHX8A5ZuHvss_0ZPJal15-uxMz4tOfTDS0'

def main():
    reporting_datasource = ReportingSurveyDataSource(kbid=KBID, key_number=KEY_NUMBER)
    chart_creator = ChartCreator(spreadsheet_id=SHEETS_ID, data=reporting_datasource)
    slide_creator = SlideCreator(presentation_id=PRESENTATION_ID)

    crosstab_chart = chart_creator.render(ChartRequest(
        title="Q2",
        dataset=ToplineSpec(varname="Q2"),
        kind=ChartKind.PIE,
    ))
    slide_creator.add_chart(crosstab_chart.spreadsheet_id, crosstab_chart.chart_id)
    crosstab_chart = chart_creator.render(ChartRequest(
        title="Q3",
        dataset=ToplineSpec(varname="Q3"),
        kind=ChartKind.PIE,
    ))
    slide_creator.add_chart(crosstab_chart.spreadsheet_id, crosstab_chart.chart_id)
    crosstab_chart = chart_creator.render(ChartRequest(
        title="Q4",
        dataset=ToplineSpec(varname="Q4"),
        kind=ChartKind.PIE,
    ))
    slide_creator.add_chart(crosstab_chart.spreadsheet_id, crosstab_chart.chart_id)

    slide_creator.add_title("Title for 3 Pie charts real data with bullets")
    for i in range(4):
        slide_creator.add_bullet(f"Bullet number {i}")
    slide_creator.create_slide()

    if True:
        pass


if __name__ == '__main__':
    main()