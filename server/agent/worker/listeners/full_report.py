import logging

from pydantic import ValidationError

from ..schema.full_report import FullReport as FullReportSchema

logger = logging.getLogger(__name__)

ROUTING_KEY = "task.full_report"

def handle(body):
    try:
        full_report_schema = FullReportSchema.model_validate_json(body)
        logger.info("task.full_report: %s", full_report_schema.model_dump_json(indent=2))
    except ValidationError as e:
        logger.error("task.full_report body didn't validate: %r", body)
    return True