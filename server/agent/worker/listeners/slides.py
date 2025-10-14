import logging
from pydantic import ValidationError

from callbacks import TaskManager
from callbacks.task.artifact_schema import Artifact
from service.llm.memo_to_slides import MemoToSlidesAgent
from ..schema.slides import Slides as SlidesSchema

logger = logging.getLogger(__name__)

ROUTING_KEY = "task.slides"

async def handle(body):
    try:
        slides_schema = SlidesSchema.model_validate_json(body)
        logger.info("task.slides: %s", slides_schema.model_dump_json(exclude={"slide_agent_prompt", "slide_outline_agent_prompt"}))
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
            task_manager,
            slide_agent_prompt=slides_schema.slide_agent_prompt,
            slide_outline_agent_prompt=slides_schema.slide_outline_agent_prompt,
            project_context=slides_schema.project_context
        )
        await memo_to_slides_agent.create_slides_from_memo(outline_focus=slides_schema.focus)

        total_tokens = memo_to_slides_agent.usage.input_tokens + memo_to_slides_agent.usage.output_tokens * 3
        task_manager.add_artifact(Artifact(
            resource_type='Slidedeck',
            action='Edit',
            total_tokens=total_tokens
        ))
        logger.info(f"Generated slidedeck for {slides_schema.kbid}")
    return