from __future__ import annotations

from .chart_creator import ChartCreator, ChartRequest
from .specs import ToplineSpec, CrosstabSpec
from .charting.registry import ChartKind

def demo():
    creator = ChartCreator(
        creds_path="service_account.json",
        spreadsheet_id="YOUR_SPREADSHEET_ID",
    )

    print(creator.render(ChartRequest(
        title="Trump Image x Gender",
        dataset=CrosstabSpec(varname="TRUMP_IMAGE", by_varname="GENDER"),
        kind=ChartKind.STACKED_COLUMN,
    )))

    print(creator.render(ChartRequest(
        title="Biden Image - Men Only",
        dataset=CrosstabSpec(varname="BIDEN_IMAGE", by_varname="GENDER", include_by_values=["Male"]),
        kind=ChartKind.COLUMN,
    )))

    print(creator.render(ChartRequest(
        title="Trump Image - Topline",
        dataset=ToplineSpec(varname="TRUMP_IMAGE"),
        kind=ChartKind.BAR,
    )))


if __name__ == "__main__":
    demo()
