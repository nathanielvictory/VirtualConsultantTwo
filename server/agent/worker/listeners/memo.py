import logging

from pydantic import ValidationError

from callbacks import TaskManager
from callbacks.task.artifact_schema import Artifact
from service.llm.insights_to_memo.insights_to_memo_agent import InsightsToMemoAgent
from ..schema.memo import Memo as MemoSchema

logger = logging.getLogger(__name__)

ROUTING_KEY = "task.memo"

async def handle(body):
    try:
        memo_schema = MemoSchema.model_validate_json(body)
        logger.info("task.memo: %s", memo_schema.model_dump_json(exclude={'insights', "text_block_agent_prompt", "memo_agent_prompt"}))
    except ValidationError as e:
        logger.error("task.memo body didn't validate: %r", body)
        return

    with TaskManager(memo_schema.task_id) as task_manager:
        insights_to_memo_agent = InsightsToMemoAgent(
            memo_schema.kbid,
            memo_schema.key_number,
            memo_schema.doc_id,
            progress_callback=task_manager,
            text_block_agent_prompt=memo_schema.text_block_agent_prompt,
            memo_agent_prompt=memo_schema.memo_agent_prompt,
        )
        await insights_to_memo_agent.create_memo_from_insights(memo_schema.insights, memo_schema.focus)

        total_tokens = insights_to_memo_agent.usage.input_tokens + insights_to_memo_agent.usage.output_tokens * 3
        task_manager.add_artifact(Artifact(
            resource_type='Memo',
            action='Edit',
            total_tokens=total_tokens
        ))
        logger.info(f"Generated memo for {memo_schema.kbid}")
    return