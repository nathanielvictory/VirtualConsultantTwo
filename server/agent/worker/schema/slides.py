from pydantic import BaseModel, ConfigDict

class Slides(BaseModel):
    task_id: int
    project_id: int
    project_context: str | None = None
    kbid: str
    key_number: int
    slidedeck_id: int
    doc_id: str
    sheets_id: str
    presentation_id: str
    focus: str | None = None
    token_limit: int | None = None
    slide_agent_prompt: str | None = None
    slide_outline_agent_prompt: str | None = None
    model_config = ConfigDict(extra="forbid")