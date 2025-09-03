# charts/stacked_column.py
from __future__ import annotations
from typing import List, Optional, Dict, Any
from ..models import Grid, ChartKind
from ..backend.sheets_backend import SheetsBackend
from .registry import register

def _infer_value_columns(n_cols: int, headers: Optional[List[str]]) -> List[int]:
    if n_cols <= 1:
        return []
    cols = list(range(1, n_cols))
    if headers and len(headers) == n_cols:
        last = headers[-1].strip().lower()
        if last in {"n", "count", "base", "sample size"} and cols:
            cols = cols[:-1]
    return cols

@register(ChartKind.STACKED_COLUMN)
def render_stacked_col(*, backend: SheetsBackend, title: str, grid: Grid,
                       legend_position: str) -> int | None:
    sheet_id, n_rows, n_cols = backend.write_grid(title, grid)

    headers = grid.headers if grid.headers else None
    value_cols = _infer_value_columns(n_cols, headers)
    if not value_cols:
        return None

    has_header = bool(headers)
    header_count = 1 if has_header else 0
    start_row = 0

    series = []
    for c in value_cols:
        s: Dict[str, Any] = {
            "series": {"sourceRange": {"sources": [{
                "sheetId": sheet_id,
                "startRowIndex": start_row,
                "endRowIndex": n_rows,
                "startColumnIndex": c,
                "endColumnIndex": c + 1,
            }]}},
            "targetAxis": "LEFT_AXIS",
        }
        series.append(s)

    spec: Dict[str, Any] = {
        "title": title,
        "basicChart": {
            "chartType": "COLUMN",
            "legendPosition": legend_position,
            "axis": [{"position": "BOTTOM_AXIS"}, {"position": "LEFT_AXIS"}],
            "domains": [{
                "domain": {"sourceRange": {"sources": [{
                    "sheetId": sheet_id,
                    "startRowIndex": start_row,
                    "endRowIndex": n_rows,
                    "startColumnIndex": 0,
                    "endColumnIndex": 1,
                }]}}
            }],
            "series": series,
            "headerCount": header_count,
            "stackedType": "STACKED",
        }
    }

    return backend.add_basic_chart(sheet_id=sheet_id, n_rows=n_rows, spec=spec)
