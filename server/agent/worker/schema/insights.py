from pydantic import BaseModel, ConfigDict

class Insights(BaseModel):
    task_id: int
    project_id: int
    kbid: str
    key_number: int
    token_limit: int | None = None
    focus: str | None = None
    number_of_insights: int | None = None
    focus_agent_prompt: str | None = None
    insight_agent_prompt: str | None = None
    model_config = ConfigDict(extra="forbid")