import logging
from pydantic import ValidationError

from ..schema.slides import Slides as SlidesSchema

logger = logging.getLogger(__name__)

ROUTING_KEY = "task.slides"

def handle(body):
    try:
        slides_schema = SlidesSchema.model_validate_json(body)
        logger.info("task.slides: %s", slides_schema.model_dump_json(indent=2))
    except ValidationError as e:
        logger.error("task.slides body didn't validate: %r", body)
    return True