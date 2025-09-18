import requests
from pydantic import ValidationError

from config import settings
from ..models.project import ProjectRead



def get_project_data(kbid: str) -> ProjectRead | None:
    reporting_url = f"{settings.REPORTING_URL}/user_data/projects/by_kbid/{kbid}"
    response = requests.get(reporting_url, headers={'X-Username': settings.REPORTING_USERNAME, 'X-Password': settings.REPORTING_PASSWORD})
    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError as e:
        return None
    try:
        project = ProjectRead.model_validate(response.json())
    except ValidationError as e:
        return None

    return project
