import requests
from pydantic import ValidationError
import asyncio

from config import settings
from ..models.survey import Survey

async def get_survey_data(kbid: str, key_number: int = 0) -> Survey | None:
    task_queue_url = f"{settings.REPORTING_URL}/exports/json_exports/survey_data/{kbid}/{key_number}"
    task_result_url = f"{settings.REPORTING_URL}/exports/json_exports/survey_data/{kbid}/{key_number}/status"
    headers = {
        "X-Username": settings.REPORTING_USERNAME,
        "X-Password": settings.REPORTING_PASSWORD,
    }
    timeout = 60 * 2
    total_waited = 0

    try:
        task_response = requests.get(task_queue_url, headers=headers)
        task_response.raise_for_status()
        task_id = task_response.json().get('task_id')
        if not task_id:
            return None
        while total_waited < timeout:
            await asyncio.sleep(2)
            total_waited += 2
            response = requests.get(f"{task_result_url}/{task_id}", headers=headers)
            response.raise_for_status()
            response_json = response.json()
            if response_json.get('status') in ("pending", "in progress"):
                continue
            if response_json.get('status') != 'done':
                return None

            survey_json = response_json.get("result")
            survey = Survey.model_validate(survey_json)
            return survey

    except (requests.exceptions.RequestException, ValidationError) as e:
            return None
