import logging
from pydantic import ValidationError
import requests


from ..schema.survey_data import SurveyData as SurveyDataSchema
from service.data.reporting_api.get_project_data import get_project_data
from service.data.ingest.update_project import update_project
from callbacks import TaskManager

logger = logging.getLogger(__name__)

ROUTING_KEY = "task.survey_data"

def handle(body):
    try:
        survey_data_schema = SurveyDataSchema.model_validate_json(body)
        logger.info("task.survey_data: %s", survey_data_schema.model_dump_json())
    except ValidationError as e:
        logger.error("task.survey_data body didn't validate: %r", body)
        return

    with TaskManager(survey_data_schema.task_id) as task_manager:
        project = get_project_data(survey_data_schema.kbid)
        if not project:
            raise ValueError(f"Project with KBID {survey_data_schema.kbid} not found")

        success = update_project(survey_data_schema.kbid, survey_data_schema.key_number)

        if not success:
            logger.info(f"Failed to update project data for {survey_data_schema.kbid}")
            return

        logger.info(f"Updated project data for {survey_data_schema.kbid}")
        headers = task_manager.get_headers()
        data = {"lastRefreshed": task_manager.get_current_timestamp()}
        requests.patch(task_manager.get_base_url() + f'/Projects/{survey_data_schema.project_id}', headers=headers, json=data)
        return