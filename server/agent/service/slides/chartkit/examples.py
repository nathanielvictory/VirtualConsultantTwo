from __future__ import annotations

from .chart_creator import ChartCreator, ChartRequest
from .specs import ToplineSpec, CrosstabSpec
from .charting.registry import ChartKind
from .charting import basic_charts

def demo():
    creator = ChartCreator(
        creds_path="service_account.json",
        spreadsheet_id="YOUR_SPREADSHEET_ID",
    )

    print(creator.render(ChartRequest(
        title="Trump Image x Gender",
        dataset=CrosstabSpec(varname="TRUMP_IMAGE", by_varname="GENDER"),
        kind=ChartKind.STACKED_COLUMN,
        sheet_name="TRUMP_X_GENDER",
    )))

    print(creator.render(ChartRequest(
        title="Biden Image - Men Only",
        dataset=CrosstabSpec(varname="BIDEN_IMAGE", by_varname="GENDER", include_by_values=["Male"]),
        kind=ChartKind.COLUMN,
        sheet_name="BIDEN_MALE",
    )))

    print(creator.render(ChartRequest(
        title="Trump Image - Topline",
        dataset=ToplineSpec(varname="TRUMP_IMAGE"),
        kind=ChartKind.BAR,
        sheet_name="TRUMP_TOPLINE",
    )))

    print(creator.render(ChartRequest(
        title="Trump x Gender (Table)",
        dataset=CrosstabSpec(varname="TRUMP_IMAGE", by_varname="GENDER"),
        kind=ChartKind.TABLE,
        sheet_name="TRUMP_X_GENDER_TABLE",
    )))

if __name__ == "__main__":
    demo()
