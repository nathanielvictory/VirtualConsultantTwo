from dataclasses import dataclass
from typing import List, Union
from .specs import DatasetSpec
from enum import Enum

Number = Union[int, float]

@dataclass(frozen=True)
class AnswerOption:
    answer_text: str
    answer_number: int

@dataclass(frozen=True)
class Question:
    question_text: str
    question_number: int
    varname: str
    answers: List[AnswerOption]

@dataclass
class Grid:
    """
    A normalized, sheets-ready table.
    headers: List[str]
    rows: List[List[Union[str, Number]]]
    """
    headers: List[str]
    rows: List[List[Union[str, Number]]]


@dataclass
class ChartRef:
    spreadsheet_id: str
    chart_id: int | None  # None for TABLE/no chart


class ChartKind(str, Enum):
    COLUMN = "COLUMN"
    BAR = "BAR"
    STACKED_COLUMN = "STACKED_COLUMN"
    STACKED_BAR = "STACKED_BAR"
    PIE = "PIE"


@dataclass
class ChartRequest:
    title: str
    dataset: DatasetSpec
    sheet_name: str = "Data"
    kind: ChartKind = ChartKind.COLUMN
    legend_position: str = "BOTTOM_LEGEND"