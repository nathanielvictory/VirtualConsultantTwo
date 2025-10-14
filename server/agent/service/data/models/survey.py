from pydantic import BaseModel


class SurveyAnswer(BaseModel):
    answer_number: int
    answer_text: str
    percentage: float
    is_subtotal: bool


class SurveyQuestion(BaseModel):
    question_number: int
    question_varname: str
    question_text: str
    survey_answers: list[SurveyAnswer]


class CrosstabAnswer(BaseModel):
    vertical_answer: str
    is_subtotal_vertical: bool
    horizontal_answer: str
    is_subtotal_horizontal: bool
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

    def remove_subtotals(self):
        def _remove_topline_subtotal_answers(question: SurveyQuestion):
            question.survey_answers = [answer for answer in question.survey_answers if not answer.is_subtotal]
            return question
        def _remove_crosstab_subtotal_answers(question: CrosstabQuestion):
            question.crosstab_answers = [answer for answer in question.crosstab_answers if (not answer.is_subtotal_vertical and not answer.is_subtotal_horizontal)]
            return question
        self.survey_topline = [
            _remove_topline_subtotal_answers(question) for question in self.survey_topline
        ]
        self.survey_crosstab = [
            _remove_crosstab_subtotal_answers(question) for question in self.survey_crosstab
        ]
