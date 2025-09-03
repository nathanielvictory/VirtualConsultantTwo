from dataclasses import dataclass
from enum import Enum
from typing import Dict, Optional, Sequence, Union

class PercentBase(str, Enum):
    ROW = "row"
    COL = "col"
    TOTAL = "total"

@dataclass
class ToplineSpec:
    varname: str
    include_values: list[str] = None

@dataclass
class CrosstabSpec:
    varname: str
    by_varname: str
    include_by_values: list[str] = None

DatasetSpec = Union[ToplineSpec, CrosstabSpec]
