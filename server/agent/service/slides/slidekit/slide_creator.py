from typing import List, Optional
import uuid

from google.oauth2 import service_account
from googleapiclient.discovery import build

from .geometry import Rect, to_pt
from .layout import AutoLayoutEngine, LayoutSpec
from .content import ContentItem, Title, Bullets, SheetsChart


class SlideCreator:
    """Composable content + auto layout.

    Usage:
        sc = SlideCreator(presentation_id=...)  # creds from service account json
        sc.add(Title(text="Heading"))
        sc.add(Bullets(items=["First", "Second"]))
        sc.add(SheetsChart(spreadsheet_id=..., chart_id=123))
        sc.create_slide()
    """

    def __init__(
        self,
        creds_path: str = "service_account.json",
        presentation_id: str = "",
        layout: Optional[AutoLayoutEngine] = None,
    ):
        SCOPES = [
            "https://www.googleapis.com/auth/presentations",
            "https://www.googleapis.com/auth/spreadsheets.readonly",
            "https://www.googleapis.com/auth/drive.readonly",
        ]
        creds = service_account.Credentials.from_service_account_file(
            creds_path, scopes=SCOPES
        )
        self.slide_service = build("slides", "v1", credentials=creds, cache_discovery=False)
        self.presentation_id = presentation_id
        self._presentation_cache = None

        self._items: List[ContentItem] = []
        self.layout_engine = layout or AutoLayoutEngine(LayoutSpec())

    # ── Public API ────────────────────────────────────────────────────────────
    def add(self, item: ContentItem):
        self._items.append(item)

    def add_title(self, text: str):
        self.add(Title(text=text))

    def add_bullet(self, text: str):
        # find or create a Bullets block
        for it in self._items:
            if isinstance(it, Bullets):
                it.items.append(text)
                return
        self.add(Bullets(items=[text]))

    def add_chart(self, spreadsheet_id: str, chart_id: int):
        self.add(SheetsChart(spreadsheet_id=spreadsheet_id, chart_id=chart_id))

    def create_slide(self) -> str:
        page_w, page_h = self._page_size_pt()
        page_rect = Rect(0.0, 0.0, page_w, page_h)

        slide_id = f"slide_{uuid.uuid4().hex}"
        requests: List[dict] = [
            {
                "createSlide": {
                    "objectId": slide_id,
                    "slideLayoutReference": {"predefinedLayout": "BLANK"},
                }
            }
        ]

        # Compute layout and emit requests per item
        placements = self.layout_engine.layout(self._items, page_rect)
        for item, rect in placements:
            requests.extend(item.to_requests(rect=rect, page_id=slide_id))

        # Execute batch
        self.slide_service.presentations().batchUpdate(
            presentationId=self.presentation_id, body={"requests": requests}
        ).execute()

        self._items.clear()
        return slide_id

    # ── Internals ─────────────────────────────────────────────────────────────
    def _get_presentation(self):
        if not self._presentation_cache:
            self._presentation_cache = self.slide_service.presentations().get(
                presentationId=self.presentation_id
            ).execute()
        return self._presentation_cache

    def _page_size_pt(self):
        ps = self._get_presentation()["pageSize"]
        unit = ps["width"].get("unit", "PT")
        return to_pt(ps["width"]["magnitude"], unit), to_pt(ps["height"]["magnitude"], unit)