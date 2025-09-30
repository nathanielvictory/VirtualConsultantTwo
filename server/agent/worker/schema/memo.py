from pydantic import BaseModel, ConfigDict

class Memo(BaseModel):
    task_id: int
    project_id: int
    kbid: str
    key_number: int
    memo_id: int
    doc_id: str
    insights: list[str]
    token_limit: int | None = None
    focus: str | None = None
    text_block_agent_prompt: str | None = None
    memo_agent_prompt: str | None = None
    model_config = ConfigDict(extra="forbid")