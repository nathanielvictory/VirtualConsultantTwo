from pydantic import BaseModel, ConfigDict

class Slides(BaseModel):
    task_id: int
    project_id: int
    kbid: str
    key_number: int
    doc_id: str
    sheets_id: str
    slides_id: str
    token_limit: int | None = None
    model_config = ConfigDict(extra="forbid")