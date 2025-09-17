
import logging

logger = logging.getLogger(__name__)

ROUTING_KEY = "task.created"

def handle(body):
    logger.info("task.created: %r", body)
    return True