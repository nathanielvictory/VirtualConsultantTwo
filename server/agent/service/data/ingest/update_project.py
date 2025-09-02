from ..reporting_api.get_survey_data import get_survey_data


def update_project(kbid: str, project_number=0):
    survey_data = get_survey_data(kbid, project_number)
    return survey_data