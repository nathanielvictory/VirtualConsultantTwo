import logging
from pydantic import ValidationError

from callbacks import TaskManager
from callbacks.task.artifact_schema import Artifact
from service.llm.memo_to_slides import MemoToSlidesAgent
from ..schema.slides import Slides as SlidesSchema

logger = logging.getLogger(__name__)

ROUTING_KEY = "task.slides"

def handle(body):
    try:
        slides_schema = SlidesSchema.model_validate_json(body)
        logger.info("task.slides: %s", slides_schema.model_dump_json())
    except ValidationError as e:
        logger.error("task.slides body didn't validate: %r", body)
        return

    with TaskManager(slides_schema.task_id) as task_manager:
        memo_to_slides_agent = MemoToSlidesAgent(
            slides_schema.kbid,
            slides_schema.key_number,
            slides_schema.doc_id,
            slides_schema.presentation_id,
            slides_schema.sheets_id,
            task_manager
        )
        memo_to_slides_agent.create_slides_from_memo()

        total_tokens = memo_to_slides_agent.usage.input_tokens + memo_to_slides_agent.usage.output_tokens * 3
        task_manager.add_artifact(Artifact(
            resource_type='Slidedeck',
            action='Edit',
            total_tokens=total_tokens
        ))
        logger.info(f"Generated slidedeck for {slides_schema.kbid}")
    return