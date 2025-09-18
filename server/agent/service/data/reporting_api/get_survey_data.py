import requests
from pydantic import ValidationError

from config import settings
from ..models.survey import Survey

def get_survey_data(kbid: str, key_number=0) -> Survey | None:
    reporting_url = f"{settings.REPORTING_URL}/exports/json_exports/survey_data/{kbid}/{key_number}"
    response = requests.get(reporting_url, headers={'X-Username': settings.REPORTING_USERNAME, 'X-Password': settings.REPORTING_PASSWORD})
    try:
        response.raise_for_status()
        survey_json = response.json()
        survey = Survey.model_validate(survey_json)
    except (requests.exceptions.HTTPError, ValidationError) as e:
        return None
    return survey
