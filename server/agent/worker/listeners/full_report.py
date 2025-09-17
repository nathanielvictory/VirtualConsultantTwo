import logging

logger = logging.getLogger(__name__)

ROUTING_KEY = "task.full_report"

def handle(body):
    logger.info("task.full_report: %r", body)
    return True