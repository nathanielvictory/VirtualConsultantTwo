import logging

logger = logging.getLogger(__name__)

ROUTING_KEY = "task.insights"

def handle(body):
    logger.info("task.insights: %r", body)
    return True