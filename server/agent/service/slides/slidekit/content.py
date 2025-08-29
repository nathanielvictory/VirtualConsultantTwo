from dataclasses import dataclass, field
from typing import List, Optional, Protocol
import uuid

from .geometry import Rect


class RequestEmitter(Protocol):
    def to_requests(self, *, rect: Rect, page_id: str) -> List[dict]:
        ...


@dataclass
class ContentItem(RequestEmitter):
    """Base class for slide content.

    Layout hints:
      - block: stacked vertically
      - weight: relative share of vertical space
      - min_h: minimal height in PT
      - preferred_h: soft target height in PT (if available)
    """
    block: bool = True
    weight: float = 1.0
    min_h: float = 24.0
    preferred_h: Optional[float] = None

    def to_requests(self, *, rect: Rect, page_id: str) -> List[dict]:  # pragma: no cover
        raise NotImplementedError


# ── Text items ────────────────────────────────────────────────────────────────
@dataclass
class Title(ContentItem):
    text: str = ""
    height: float = 60.0
    align: str = "CENTER"  # LEFT, CENTER, RIGHT

    def __post_init__(self):
        self.block = True
        self.weight = 0.0
        self.preferred_h = self.height
        self.min_h = self.height

    def to_requests(self, *, rect: Rect, page_id: str) -> List[dict]:
        obj_id = f"title_{uuid.uuid4().hex}"
        return [
            {
                "createShape": {
                    "objectId": obj_id,
                    "shapeType": "TEXT_BOX",
                    "elementProperties": {
                        "pageObjectId": page_id,
                        "size": {
                            "width": {"magnitude": rect.w, "unit": "PT"},
                            "height": {"magnitude": rect.h, "unit": "PT"},
                        },
                        "transform": {
                            "scaleX": 1,
                            "scaleY": 1,
                            "shearX": 0,
                            "shearY": 0,
                            "translateX": rect.x,
                            "translateY": rect.y,
                            "unit": "PT",
                        },
                    },
                }
            },
            {"insertText": {"objectId": obj_id, "insertionIndex": 0, "text": self.text}},
            {
                "updateParagraphStyle": {
                    "objectId": obj_id,
                    "style": {"alignment": self.align},  # "START" | "CENTER" | "END" | "JUSTIFIED"
                    "fields": "alignment",
                    "textRange": {"type": "ALL"}         # <-- correct field name
                }
            },
        ]


@dataclass
class Bullets(ContentItem):
    items: List[str] = field(default_factory=list)

    def to_requests(self, *, rect: Rect, page_id: str) -> List[dict]:
        if not self.items:
            return []
        obj_id = f"bullets_{uuid.uuid4().hex}"
        text = "\n".join(self.items)
        return [
            {
                "createShape": {
                    "objectId": obj_id,
                    "shapeType": "TEXT_BOX",
                    "elementProperties": {
                        "pageObjectId": page_id,
                        "size": {
                            "width": {"magnitude": rect.w, "unit": "PT"},
                            "height": {"magnitude": rect.h, "unit": "PT"},
                        },
                        "transform": {
                            "scaleX": 1,
                            "scaleY": 1,
                            "shearX": 0,
                            "shearY": 0,
                            "translateX": rect.x,
                            "translateY": rect.y,
                            "unit": "PT",
                        },
                    },
                }
            },
            {"insertText": {"objectId": obj_id, "insertionIndex": 0, "text": text}},
            {
                "createParagraphBullets": {
                    "objectId": obj_id,
                    "textRange": {"type": "ALL"},
                    "bulletPreset": "BULLET_DISC_CIRCLE_SQUARE",
                }
            },
        ]


# ── Media items (Google Sheets charts for v1) ────────────────────────────────
@dataclass
class SheetsChart(ContentItem):
    spreadsheet_id: str = ""
    chart_id: int = 0
    link_mode: str = "LINKED"

    def __post_init__(self):
        self.block = True
        self.weight = 1.0

    def to_requests(self, *, rect: Rect, page_id: str) -> List[dict]:
        obj_id = f"chart_{uuid.uuid4().hex}"
        return [
            {
                "createSheetsChart": {
                    "objectId": obj_id,
                    "spreadsheetId": self.spreadsheet_id,
                    "chartId": self.chart_id,
                    "linkingMode": self.link_mode,
                    "elementProperties": {
                        "pageObjectId": page_id,
                        "size": {
                            "width": {"magnitude": rect.w, "unit": "PT"},
                            "height": {"magnitude": rect.h, "unit": "PT"},
                        },
                        "transform": {
                            "scaleX": 1,
                            "scaleY": 1,
                            "shearX": 0,
                            "shearY": 0,
                            "translateX": rect.x,
                            "translateY": rect.y,
                            "unit": "PT",
                        },
                    },
                }
            }
        ]
