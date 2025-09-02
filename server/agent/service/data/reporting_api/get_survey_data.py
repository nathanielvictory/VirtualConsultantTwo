import requests

from config import settings
from ..models.survey import Survey

def get_survey_data(kbid: str, project_number=0) -> Survey:
    reporting_url = f"{settings.REPORTING_URL}exports/json_exports/survey_data/{kbid}/{project_number}"
    response = requests.get(reporting_url, headers={'X-Username': settings.REPORTING_USERNAME, 'X-Password': settings.REPORTING_PASSWORD})
    response.raise_for_status()
    survey_json = response.json()
    survey = Survey.model_validate(survey_json)
    return survey
