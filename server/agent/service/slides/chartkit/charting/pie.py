# charts/pie.py
from __future__ import annotations
from typing import List, Optional, Dict, Any
from ..models import Grid, ChartKind
from ..backend.sheets_backend import SheetsBackend
from .registry import register

def _infer_value_columns(n_cols: int, headers: Optional[List[str]]) -> List[int]:
    """
    Same heuristic as in charts/bar.py:
    - Treat column 0 as the category/domain.
    - Use columns 1..n as value candidates.
    - If the last header looks like a count/base column, drop it.
    """
    if n_cols <= 1:
        return []
    cols = list(range(1, n_cols))
    if headers and len(headers) == n_cols:
        last = headers[-1].strip().lower()
        if last in {"n", "count", "base", "sample size"} and cols:
            cols = cols[:-1]
    return cols


# TODO doesn't support crosstab data, render a different chart if crosstab is sensed
@register(ChartKind.PIE)
def render_pie(
    *,
    backend: SheetsBackend,
    title: str,
    sheet_name: str,
    grid: Grid,
    legend_position: str
) -> int | None:
    """
    Render a single-series PIE chart using column 0 as categories and
    the first inferred value column as the slice values.
    """
    sheet_id, n_rows, n_cols = backend.write_grid(sheet_name, grid)

    headers = grid.headers if grid.headers else None
    value_cols = _infer_value_columns(n_cols, headers)
    if not value_cols:
        return None

    # Use the first inferred value column for the pie values
    value_col = value_cols[0]

    has_header = bool(headers)
    # For pie charts, exclude header row from ranges if present.
    start_row = 1 if has_header else 0

    domain_range = {
        "sheetId": sheet_id,
        "startRowIndex": start_row,
        "endRowIndex": n_rows,
        "startColumnIndex": 0,   # categories
        "endColumnIndex": 1,
    }
    series_range = {
        "sheetId": sheet_id,
        "startRowIndex": start_row,
        "endRowIndex": n_rows,
        "startColumnIndex": value_col,
        "endColumnIndex": value_col + 1,
    }

    spec: Dict[str, Any] = {
        "title": title,
        "pieChart": {
            "legendPosition": legend_position,
            "domain": {
                "sourceRange": { "sources": [domain_range] }
            },
            "series": {
                "sourceRange": { "sources": [series_range] }
            },
        },
    }

    # If your backend method name implies "basic", make sure it just forwards `spec`
    # as-is. If it enforces basicChart, expose a generic add_chart(...) and call that.
    return backend.add_basic_chart(sheet_id=sheet_id, n_rows=n_rows, spec=spec)

