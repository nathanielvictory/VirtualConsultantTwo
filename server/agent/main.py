from server.agent.service.slides.slidekit import SlideCreator, Title, Bullets, SheetsChart
from service.slides.chart_creator import ChartCreator

PRESENTATION_ID = '1xXayw9SkskXMQ8hO828sxz1BNdttoTcT7eXsOs78ADI'
SHEETS_ID = '1US9PKrFlIZI-44lA7zZtfaWQoCSjVPOrfSCXQlwycXg'


def main():
    chart_creator = ChartCreator()
    chart_creator.set_data(
        headers=["Month", "Sales"],
        rows=[["Jan", 120], ["Feb", 150], ["Mar", 130], ["Apr", 180]],
    )
    chart_ref = chart_creator.create_column_chart(sheet_title="Monthly Sales")

    slide_creator = SlideCreator(presentation_id=PRESENTATION_ID)
    slide_creator.add_bullet("Testing bullet number one")
    slide_creator.add_bullet("Testing bullet number two")
    slide_creator.add_title("Title Test")
    slide_creator.add_chart(chart_ref.spreadsheet_id, chart_ref.chart_id)
    slide_creator.add_chart(chart_ref.spreadsheet_id, chart_ref.chart_id)
    # slide_creator.add_chart(chart_ref.spreadsheet_id, chart_ref.chart_id)
    # slide_creator.add_chart(chart_ref.spreadsheet_id, chart_ref.chart_id)

    slide_creator.create_slide()
    if True:
        pass


if __name__ == '__main__':
    main()