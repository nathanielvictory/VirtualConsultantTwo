from dataclasses import dataclass
from enum import Enum
from typing import Dict, Optional, Sequence, Union
from pydantic import BaseModel, Field


class ToplineSpec(BaseModel):
    varname: str = Field(description="The shortened name for the question")
    include_values: list[str] = Field(default=None, description="List of answers to include, optional")


class CrosstabSpec(BaseModel):
    varname: str = Field(description="The shortened name for the vertical question")
    by_varname: str = Field(description="The shortened name for the horizontal question")
    include_by_values: list[str] = Field(default=None, description="List of answers in by_varname to include, optional")

DatasetSpec = Union[ToplineSpec, CrosstabSpec]
