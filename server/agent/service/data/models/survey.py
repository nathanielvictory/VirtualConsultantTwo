from pydantic import BaseModel


class SurveyAnswer(BaseModel):
    answer_number: int
    answer_text: str
    percentage: float


class SurveyQuestion(BaseModel):
    question_number: int
    question_varname: str
    question_text: str
    survey_answers: list[SurveyAnswer]


class CrosstabAnswer(BaseModel):
    vertical_answer: str
    horizontal_answer: str
    percentage: float


class CrosstabQuestion(BaseModel):
    vertical_varname: str
    vertical_question: str
    horizontal_varname: str
    horizontal_question: str
    crosstab_answers: list[CrosstabAnswer]


class Survey(BaseModel):
    name: str
    kbid: str
    project_number: int
    survey_topline: list[SurveyQuestion]
    survey_crosstab: list[CrosstabQuestion]
