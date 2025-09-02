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
    filters: Optional[Dict[str, Union[str, Sequence[str]]]] = None
    percent_base: PercentBase = PercentBase.TOTAL

@dataclass
class CrosstabSpec:
    varname: str
    by_varname: str
    include_by_values: Optional[Sequence[str]] = None
    filters: Optional[Dict[str, Union[str, Sequence[str]]]] = None
    percent_base: PercentBase = PercentBase.ROW

DatasetSpec = Union[ToplineSpec, CrosstabSpec]
