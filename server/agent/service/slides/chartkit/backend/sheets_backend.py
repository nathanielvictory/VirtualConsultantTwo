# sheets_backend.py
from __future__ import annotations
from typing import Tuple, List, Optional, Dict, Any
from google.oauth2 import service_account
from googleapiclient.discovery import build

from ..models import Grid

def _overlay_below_data(sheet_id: int, n_rows: int) -> Dict[str, Any]:
    return {
        "overlayPosition": {
            "anchorCell": {"sheetId": sheet_id, "rowIndex": n_rows + 1, "columnIndex": 0},
            "widthPixels": 800,
            "heightPixels": 380,
        }
    }

class SheetsBackend:
    """Minimal Google Sheets I/O + chart creation."""

    def __init__(self, creds_path: str, spreadsheet_id: str):
        self.spreadsheet_id = spreadsheet_id
        creds = service_account.Credentials.from_service_account_file(
            creds_path, scopes=["https://www.googleapis.com/auth/spreadsheets"]
        )
        self.sheets = build("sheets", "v4", credentials=creds, cache_discovery=False)

    def write_grid(self, sheet_name: str, grid: Grid) -> Tuple[int, int, int]:
        values = ([grid.headers] if grid.headers else []) + grid.rows
        n_rows = len(values)
        n_cols = max((len(r) for r in values), default=0)

        # Make new sheet
        meta = self.sheets.spreadsheets().get(spreadsheetId=self.spreadsheet_id).execute()
        n = len(meta.get("sheets", []))
        sheet_name = f"{n}-{sheet_name}"
        sheet_name = sheet_name[:80]
        resp = self.sheets.spreadsheets().batchUpdate(
            spreadsheetId=self.spreadsheet_id,
            body={"requests": [{"addSheet": {"properties": {"title": sheet_name}}}]},
        ).execute()
        sheet_id = resp["replies"][0]["addSheet"]["properties"]["sheetId"]

        # clear and write
        self.sheets.spreadsheets().values().clear(
            spreadsheetId=self.spreadsheet_id, range=f"{sheet_name}!A:ZZ"
        ).execute()
        if values:
            self.sheets.spreadsheets().values().update(
                spreadsheetId=self.spreadsheet_id,
                range=f"{sheet_name}!A1",
                valueInputOption="RAW",
                body={"values": values},
            ).execute()
        return sheet_id, n_rows, n_cols

    def add_basic_chart(self, *, sheet_id: int, n_rows: int, spec: Dict[str, Any]) -> Optional[int]:
        """Add a chart using a fully-formed BasicChart spec."""
        req = {
            "requests": [{
                "addChart": {
                    "chart": {
                        "spec": spec,
                        "position": _overlay_below_data(sheet_id, n_rows)
                    }
                }
            }]
        }
        resp = self.sheets.spreadsheets().batchUpdate(
            spreadsheetId=self.spreadsheet_id, body=req
        ).execute()
        return resp["replies"][0]["addChart"]["chart"]["chartId"]
