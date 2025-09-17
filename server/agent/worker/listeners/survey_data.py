import logging

logger = logging.getLogger(__name__)

ROUTING_KEY = "task.survey_data"

def handle(body):
    logger.info("task.survey_data: %r", body)
    return True