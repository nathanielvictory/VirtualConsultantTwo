import logging

logger = logging.getLogger(__name__)

ROUTING_KEY = "task.memo"

def handle(body):
    logger.info("task.memo: %r", body)
    return True