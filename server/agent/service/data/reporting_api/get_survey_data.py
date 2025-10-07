import requests
from pydantic import ValidationError
import httpx

from config import settings
from ..models.survey import Survey

async def get_survey_data(kbid: str, key_number: int = 0) -> Survey | None:
    reporting_url = f"{settings.REPORTING_URL}/exports/json_exports/survey_data/{kbid}/{key_number}"
    headers = {
        "X-Username": settings.REPORTING_USERNAME,
        "X-Password": settings.REPORTING_PASSWORD,
    }

    timeout = httpx.Timeout(
        connect=10.0,  # time to establish connection
        read=240.0,  # time to read response (since it can take ~2 minutes)
        write=30.0,  # time allowed for sending the request body
        pool=10.0  # time to wait for a connection from the pool
    )
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            response = await client.get(reporting_url, headers=headers)
            response.raise_for_status()
            survey_json = response.json()
            return Survey.model_validate(survey_json)
        except (httpx.HTTPStatusError, ValidationError, httpx.RequestError) as e:
            return None
