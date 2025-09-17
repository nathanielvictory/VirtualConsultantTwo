from pydantic import BaseModel, ConfigDict

class Memo(BaseModel):
    task_id: int
    project_id: int
    kbid: str
    key_number: int
    doc_id: str
    token_limit: int | None = None
    model_config = ConfigDict(extra="forbid")