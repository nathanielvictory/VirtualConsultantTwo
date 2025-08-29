from dataclasses import dataclass
from typing import List, Tuple

from .geometry import Rect
from .content import ContentItem, Title, SheetsChart, Bullets

@dataclass
class LayoutSpec:
    margin: float = 18.0
    gap: float = 9.0

def _grid(rect: Rect, cols: int, rows: int, gap: float) -> list[Rect]:
    cells: list[Rect] = []
    if cols <= 0 or rows <= 0:
        return cells
    cell_w = (rect.w - (cols - 1) * gap) / cols
    cell_h = (rect.h - (rows - 1) * gap) / rows
    y = rect.y
    for _r in range(rows):
        x = rect.x
        for _c in range(cols):
            cells.append(Rect(x, y, cell_w, cell_h))
            x += cell_w + gap
        y += cell_h + gap
    return cells

class AutoLayoutEngine:
    """
    Dynamic behaviors (v4):
      • Only media:
          1 → full-bleed within margins
          2 → two columns (50/50)
          3–4 → 2×2 grid; 5+ extras stack below
      • Only text (title/bullets/other): full-width; centered title row if present
      • Title + media (no other text): centered title + media below using rules above
      • Bullets + 1 chart: 50/50 split (equal priority), bullets left, chart right
      • Bullets + 2+ charts: bullets take only needed height; charts span a single row across the bottom
    """
    def __init__(self, spec: LayoutSpec | None = None):
        self.spec = spec or LayoutSpec()

    def layout(self, items: List[ContentItem], page: Rect) -> List[Tuple[ContentItem, Rect]]:
        m, g = self.spec.margin, self.spec.gap
        frame = page.inset(m, m)
        assignments: List[Tuple[ContentItem, Rect]] = []

        # Partition kinds
        titles = [i for i in items if isinstance(i, Title)]
        media  = [i for i in items if isinstance(i, SheetsChart)]
        bullets = [i for i in items if isinstance(i, Bullets)]
        other_text = [i for i in items if not isinstance(i, (Title, SheetsChart, Bullets))]

        # Reserve a title row (first only)
        remaining = frame
        if titles:
            t = titles[0]
            t_h = t.preferred_h or 60.0
            t_rect, remaining = remaining.split_h(remaining.y + t_h + g)
            t_rect = Rect(t_rect.x, t_rect.y, t_rect.w, max(t_rect.h - g, 0))
            assignments.append((t, t_rect))

        has_other_text = len(other_text) > 0
        has_bullets = len(bullets) > 0
        media_n = len(media)

        # A) media only (or title + media only)
        if media_n > 0 and not has_bullets and not has_other_text:
            media_area = remaining
            if media_n == 1:
                assignments.append((media[0], media_area))
            elif media_n == 2:
                l, r = media_area.split_v_prop(0.5, gap=g)
                assignments.append((media[0], l))
                assignments.append((media[1], r))
            else:
                cells = _grid(media_area, 2, 2, g)
                for idx, it in enumerate(media[:4]):
                    assignments.append((it, cells[idx]))
                if media_n > 4:
                    extra_start_y = cells[-1].bottom + g if cells else media_area.y
                    extra_rect = Rect(media_area.x, extra_start_y, media_area.w, max(0.0, media_area.bottom - extra_start_y))
                    assignments += self._stack_column(media[4:], extra_rect)
            return assignments

        # B) only text (no media)
        if media_n == 0 and (has_bullets or has_other_text):
            assignments += self._stack_column(bullets + other_text, remaining)
            return assignments

        # C) bullets + media special cases
        if has_bullets and media_n > 0:
            if media_n == 1:
                # Equal priority split for single chart
                text_col, chart_col = remaining.split_v_prop(0.5, gap=g)  # 50/50
                assignments += self._stack_column(bullets + other_text, text_col)
                assignments.append((media[0], chart_col))
                return assignments
            else:
                # 2+ charts: bullets top (dynamic height), charts in a single row at bottom
                # Estimate bullet height; clamp to leave room for charts
                est_bul_h = self._estimate_text_height(bullets + other_text)
                charts_min_h = 140.0  # heuristic minimum for a readable row of charts
                max_bul_h = max(0.0, remaining.h - charts_min_h - g)
                bul_h = min(est_bul_h, max_bul_h)

                # If estimate is tiny, give bullets a reasonable minimum
                bul_h = max(bul_h, 72.0)  # 1–3 lines of bullets still feel OK

                bullet_rect, chart_area = remaining.split_h(remaining.y + bul_h + g)
                assignments += self._stack_column(bullets + other_text, bullet_rect)

                # Lay all charts across a single row
                cols = media_n
                # Prevent columns from being comically thin; clamp to at most 4 per row
                if cols > 4:
                    cols = 4
                cells = _grid(chart_area, cols=cols, rows=1, gap=g)
                for idx, it in enumerate(media):
                    if idx < len(cells):
                        assignments.append((it, cells[idx]))
                # If there are >4 charts, stack the remainder below
                if media_n > len(cells):
                    extra_start_y = cells[-1].bottom + g if cells else chart_area.y
                    extra_rect = Rect(chart_area.x, extra_start_y, chart_area.w, max(0.0, chart_area.bottom - extra_start_y))
                    assignments += self._stack_column(media[len(cells):], extra_rect)
                return assignments

        # D) other text + media (no bullets): sensible default
        if has_other_text and media_n > 0:
            text_col, media_col = remaining.split_v_prop(0.58, gap=g)
            assignments += self._stack_column(other_text, text_col)
            assignments += self._stack_column(media, media_col)
            return assignments

        # Fallback (e.g., just a title)
        return assignments

    def _stack_column(self, items: List[ContentItem], col: Rect) -> List[Tuple[ContentItem, Rect]]:
        if not items or col.w <= 0 or col.h <= 0:
            return []
        total_weight = sum(max(0.0, i.weight) for i in items) or 1.0
        y = col.y
        placed: List[Tuple[ContentItem, Rect]] = []
        remaining_h = col.h - (len(items) - 1) * self.spec.gap
        for idx, item in enumerate(items):
            if item.preferred_h:
                h = min(item.preferred_h, remaining_h)
            else:
                h = max(item.min_h, remaining_h * (item.weight / total_weight))
            r = Rect(col.x, y, col.w, h)
            placed.append((item, r))
            y += h + self.spec.gap
            remaining_h = max(0.0, col.bottom - y - (len(items) - idx - 2) * self.spec.gap)
        return placed

    def _estimate_text_height(self, items: List[ContentItem]) -> float:
        """
        Heuristic for bullets/other text:
          - Bullets: line_height * number_of_items + padding
          - Other text: preferred_h if set, else min_h
        """
        line_h = 24.0       # approximate line height in PT
        pad = 16.0          # top/bottom padding
        total = 0.0
        for it in items:
            if isinstance(it, Bullets):
                n = max(1, len(it.items))
                total += n * line_h + pad
            else:
                total += it.preferred_h or it.min_h
        return total
