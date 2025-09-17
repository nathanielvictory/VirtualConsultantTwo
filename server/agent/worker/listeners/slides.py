import logging

logger = logging.getLogger(__name__)

ROUTING_KEY = "task.slides"

def handle(body):
    logger.info("task.slides: %r", body)
    return True