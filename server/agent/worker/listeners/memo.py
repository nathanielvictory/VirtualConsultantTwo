import logging

from pydantic import ValidationError

from callbacks import TaskManager
from ..schema.memo import Memo as MemoSchema

logger = logging.getLogger(__name__)

ROUTING_KEY = "task.memo"

def handle(body):
    try:
        memo_schema = MemoSchema.model_validate_json(body)
        logger.info("task.memo: %s", memo_schema.model_dump_json(exclude={'insights'}))
    except ValidationError as e:
        logger.error("task.memo body didn't validate: %r", body)
        return

    with TaskManager(memo_schema.task_id) as task_manager:
        pass

    return