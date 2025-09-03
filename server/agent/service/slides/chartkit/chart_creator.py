from typing import Optional

from .models import Grid, ChartRef, ChartRequest
from .specs import DatasetSpec, ToplineSpec, CrosstabSpec
from service.data.mock_datasource import SurveyDataSource, MockSurveyData
from .backend.sheets_backend import SheetsBackend
from .charting.registry import get_renderer



class ChartCreator:
    """
    High-level façade with sane defaults:
      - Auto-wires MockSurveyData and SheetsBackend if not provided.
      - render(ChartRequest) -> ChartRef
      - Charts are placed on the SAME TAB as the data, directly below the table.
    """
    def __init__(
        self,
        data: Optional[SurveyDataSource] = None,
        sheets: Optional[SheetsBackend] = None,
        *,
        creds_path: str = "service_account.json",
        spreadsheet_id: str = "YOUR_SPREADSHEET_ID",
    ):
        self.data = data or MockSurveyData()
        self.sheets = sheets or SheetsBackend(creds_path=creds_path, spreadsheet_id=spreadsheet_id)

    def _grid_from_spec(self, spec: DatasetSpec) -> Grid:
        if isinstance(spec, ToplineSpec):
            return self.data.get_topline(
                spec.varname, filters=spec.filters, percent_base=spec.percent_base.value
            )
        elif isinstance(spec, CrosstabSpec):
            return self.data.get_crosstab(
                spec.varname, spec.by_varname,
                include_by_values=spec.include_by_values,
                filters=spec.filters,
                percent_base=spec.percent_base.value,
            )
        else:
            raise TypeError(f"Unsupported dataset spec: {type(spec)}")

    def render(self, req: ChartRequest) -> ChartRef:
        grid = self._grid_from_spec(req.dataset)
        renderer = get_renderer(req.kind)
        chart_id = renderer(
            backend=self.sheets,
            title=req.title,
            grid=grid,
            legend_position=req.legend_position,
        )
        return ChartRef(self.sheets.spreadsheet_id, chart_id)

