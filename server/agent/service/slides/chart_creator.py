# chart_creator.py (existing-spreadsheet variant)
from typing import List, Optional
from google.oauth2 import service_account
from googleapiclient.discovery import build

SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"
SCOPES = [SHEETS_SCOPE]

class ChartRef:
    def __init__(self, spreadsheet_id: str, chart_id: int):
        self.spreadsheet_id = spreadsheet_id
        self.chart_id = chart_id

class ChartCreator:
    """
    Use an existing spreadsheet (pre-created by a human) as the chart data source.
      cc = ChartCreator("service_account.json", spreadsheet_id="EXISTING_SHEET_ID")
      cc.set_data(["Label","Value"], [["A", 10], ["B", 20]])
      chart_ref = cc.create_column_chart(sheet_title="My Chart", sheet_name="Data_for_Slides")
    """
    def __init__(self, creds_path: str = 'service_account.json', spreadsheet_id: str = '1US9PKrFlIZI-44lA7zZtfaWQoCSjVPOrfSCXQlwycXg'):
        self.creds = service_account.Credentials.from_service_account_file(
            creds_path, scopes=SCOPES
        )
        self.sheets = build("sheets", "v4", credentials=self.creds, cache_discovery=False)
        self.spreadsheet_id = spreadsheet_id
        self.headers: List[str] = []
        self.rows: List[List] = []

    def set_data(self, headers: List[str], rows: List[List]):
        self.headers = headers
        self.rows = rows

    def _get_or_create_sheet(self, sheet_name: str) -> int:
        # Try to find the sheet by title
        meta = self.sheets.spreadsheets().get(spreadsheetId=self.spreadsheet_id).execute()
        for s in meta.get("sheets", []):
            if s["properties"]["title"] == sheet_name:
                return s["properties"]["sheetId"]
        # Not found: add a new sheet tab (requires edit permission on the spreadsheet)
        req = {"requests": [{"addSheet": {"properties": {"title": sheet_name}}}]}
        resp = self.sheets.spreadsheets().batchUpdate(
            spreadsheetId=self.spreadsheet_id, body=req
        ).execute()
        return resp["replies"][0]["addSheet"]["properties"]["sheetId"]

    def _write_data(self, sheet_name: str):
        values = [self.headers] + self.rows if self.headers else self.rows
        self.sheets.spreadsheets().values().clear(
            spreadsheetId=self.spreadsheet_id, range=f"{sheet_name}!A:Z"
        ).execute()
        self.sheets.spreadsheets().values().update(
            spreadsheetId=self.spreadsheet_id,
            range=f"{sheet_name}!A1",
            valueInputOption="RAW",
            body={"values": values},
        ).execute()

    def create_column_chart(self, sheet_title: str = "Chart", sheet_name: str = "Data") -> ChartRef:
        if not (self.headers or self.rows):
            raise ValueError("No data set. Call set_data(headers, rows) first.")

        sheet_id = self._get_or_create_sheet(sheet_name)
        self._write_data(sheet_name)

        num_rows = (1 if self.headers else 0) + len(self.rows)
        num_cols = max(len(self.headers), max((len(r) for r in self.rows), default=0))
        end_col = num_cols - 1

        add_chart_req = {
            "requests": [
                {
                    "addChart": {
                        "chart": {
                            "spec": {
                                "title": sheet_title,
                                "basicChart": {
                                    "chartType": "COLUMN",
                                    "legendPosition": "BOTTOM_LEGEND",
                                    "axis": [
                                        {"position": "BOTTOM_AXIS"},
                                        {"position": "LEFT_AXIS"},
                                    ],
                                    "domains": [
                                        {
                                            "domain": {
                                                "sourceRange": {
                                                    "sources": [
                                                        {
                                                            "sheetId": sheet_id,
                                                            "startRowIndex": 1 if self.headers else 0,
                                                            "endRowIndex": num_rows,
                                                            "startColumnIndex": 0,
                                                            "endColumnIndex": 1,
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    "series": [
                                        {
                                            "series": {
                                                "sourceRange": {
                                                    "sources": [
                                                        {
                                                            "sheetId": sheet_id,
                                                            "startRowIndex": 1 if self.headers else 0,
                                                            "endRowIndex": num_rows,
                                                            "startColumnIndex": 1,
                                                            "endColumnIndex": end_col + 1,
                                                        }
                                                    ]
                                                }
                                            },
                                            "targetAxis": "LEFT_AXIS",
                                        }
                                    ],
                                    "headerCount": 1 if self.headers else 0,
                                }
                            },
                            "position": {
                                "newSheet": True  # ✅ changed here
                            },
                        }
                    }
                }
            ]
        }
        resp = self.sheets.spreadsheets().batchUpdate(
            spreadsheetId=self.spreadsheet_id, body=add_chart_req
        ).execute()
        chart_id = resp["replies"][0]["addChart"]["chart"]["chartId"]
        return ChartRef(self.spreadsheet_id, chart_id)
