from dataclasses import dataclass
from typing import Tuple

PT_PER_EMU = 1 / 12700.0

@dataclass(frozen=True)
class Size:
    w: float
    h: float

@dataclass(frozen=True)
class Point:
    x: float
    y: float

@dataclass(frozen=True)
class Rect:
    x: float
    y: float
    w: float
    h: float

    @property
    def right(self) -> float:
        return self.x + self.w

    @property
    def bottom(self) -> float:
        return self.y + self.h

    def inset(self, dx: float, dy: float) -> "Rect":
        return Rect(self.x + dx, self.y + dy, self.w - 2 * dx, self.h - 2 * dy)

    def split_h(self, at: float) -> Tuple["Rect", "Rect"]:
        """Split horizontally at absolute y; returns top, bottom."""
        top_h = max(0.0, at - self.y)
        bottom_h = max(0.0, self.h - top_h)
        return Rect(self.x, self.y, self.w, top_h), Rect(self.x, at, self.w, bottom_h)

    def split_v_prop(self, left_ratio: float, gap: float = 0.0) -> Tuple["Rect","Rect"]:
        left_w = self.w * left_ratio - gap / 2
        right_w = self.w * (1 - left_ratio) - gap / 2
        left = Rect(self.x, self.y, left_w, self.h)
        right = Rect(self.x + left_w + gap, self.y, right_w, self.h)
        return left, right


def to_pt(mag: float, unit: str) -> float:
    return mag * PT_PER_EMU if unit == "EMU" else float(mag)


def affine(x: float, y: float, unit: str = "PT") -> dict:
    return {
        "scaleX": 1,
        "scaleY": 1,
        "shearX": 0,
        "shearY": 0,
        "translateX": x,
        "translateY": y,
        "unit": unit,
    }
