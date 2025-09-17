from pydantic import BaseModel, ConfigDict

class Insights(BaseModel):
    task_id: int
    project_id: int
    kbid: str
    key_number: int
    token_limit: int | None = None
    model_config = ConfigDict(extra="forbid")