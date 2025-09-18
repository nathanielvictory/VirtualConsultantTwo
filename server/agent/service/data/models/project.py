from pydantic import BaseModel, ConfigDict
from datetime import date

# Project Schemas
class ProjectRead(BaseModel):
    kbid: str
    live_split: float | None
    text_split: float | None
    project_n: int | None
    project_name: str | None
    project_status: str | None
    state: str | None
    report_status: str | None
    start_date: date | None
    reports_json: dict | None
    orders_json: dict | None
    id: int | None

    ConfigDict(from_attributes=True)