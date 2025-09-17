from pydantic import BaseModel, ConfigDict

class SurveyData(BaseModel):
    task_id: int
    project_id: int
    kbid: str
    key_number: int
    model_config = ConfigDict(extra="forbid")