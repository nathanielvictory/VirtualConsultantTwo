import logging
from pydantic import ValidationError

from ..schema.survey_data import SurveyData as SurveyDataSchema

logger = logging.getLogger(__name__)

ROUTING_KEY = "task.survey_data"

def handle(body):
    try:
        survey_data_schema = SurveyDataSchema.model_validate_json(body)
        logger.info("task.survey_data: %s", survey_data_schema.model_dump_json(indent=2))
    except ValidationError as e:
        logger.error("task.survey_data body didn't validate: %r", body)
    return True