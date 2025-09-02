from __future__ import annotations
from enum import Enum
from typing import Dict, Protocol

from ..models import Grid, ChartKind
from ..backend.sheets_backend import SheetsBackend

class Renderer(Protocol):
    def __call__(
        self,
        *,
        backend: SheetsBackend,
        title: str,
        sheet_name: str,
        grid: Grid,
        legend_position: str,
    ) -> int | None: ...  # return chart_id (None for TABLE)

_REGISTRY: Dict[ChartKind, Renderer] = {}

def register(kind: ChartKind):
    def _wrap(func: Renderer) -> Renderer:
        _REGISTRY[kind] = func
        return func
    return _wrap

def get_renderer(kind: ChartKind) -> Renderer:
    try:
        return _REGISTRY[kind]
    except KeyError:
        raise ValueError(f"No renderer registered for {kind}")
