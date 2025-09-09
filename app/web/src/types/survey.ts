export interface SurveyAnswer {
    answer_number: number;
    answer_text: string;
    percentage: number;
}

export interface SurveyQuestion {
    question_number: number;
    question_varname: string;
    question_text: string;
    survey_answers: SurveyAnswer[];
}

export interface CrosstabAnswer {
    vertical_answer: string;
    horizontal_answer: string;
    percentage: number;
}

export interface CrosstabQuestion {
    vertical_varname: string;
    vertical_question: string;
    horizontal_varname: string;
    horizontal_question: string;
    crosstab_answers: CrosstabAnswer[];
}

export interface Survey {
    name: string;
    kbid: string;
    project_number: number;
    survey_topline: SurveyQuestion[];
    survey_crosstab: CrosstabQuestion[];
}
