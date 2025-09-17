import logging

from pydantic import ValidationError

from ..schema.insights import Insights as InsightsSchema

logger = logging.getLogger(__name__)

ROUTING_KEY = "task.insights"

def handle(body):
    try:
        insights_schema = InsightsSchema.model_validate_json(body)
        logger.info("task.insights: %s", insights_schema.model_dump_json(indent=2))
    except ValidationError as e:
        logger.error("task.insights body didn't validate: %r", body)
    return True