import logging
from pydantic import ValidationError
import requests
from datetime import datetime, timezone

from callbacks.task.artifact_schema import Artifact
from config import settings
from ..schema.insights import Insights as InsightsSchema
from service.data.reporting_api.get_project_data import get_project_data
from service.llm.survey_to_insights import SurveyToInsightsAgent
from callbacks import TaskManager

logger = logging.getLogger(__name__)

ROUTING_KEY = "task.insights"

def handle(body):
    try:
        logger.info(body)
        insights_schema = InsightsSchema.model_validate_json(body)
        logger.info("task.insights: %s", insights_schema.model_dump_json())
    except ValidationError as e:
        logger.error("task.insights body didn't validate: %r", body)
        return

    with TaskManager(insights_schema.task_id) as task_manager:
        agent = SurveyToInsightsAgent(kbid=insights_schema.kbid, key_number=insights_schema.key_number)

        if insights_schema.number_of_insights is None and insights_schema.focus is None:
            new_insights = agent.get_insights()
        else:
            num = insights_schema.number_of_insights if insights_schema.number_of_insights else 1
            focus = insights_schema.focus if insights_schema.focus else "The client has not provided a specific focus."
            new_insights = agent.get_insights([focus], min(num, 5))

        tokens_per_insight = (agent.usage.input_tokens + agent.usage.output_tokens * 3) // len(new_insights)
        for insight in new_insights:
            headers = task_manager.get_headers()
            data = {"projectId": insights_schema.project_id, 'content': insight, 'source': 'Llm'}
            response = requests.post(task_manager.get_base_url() + f'/Insights', headers=headers, json=data)
            insight_id = response.json().get('id')
            task_manager.add_artifact(Artifact(
                resource_type='Insight',
                action='Create',
                created_resource_id=insight_id,
                total_tokens=tokens_per_insight,
            ))
        logger.info(f"Generated {len(new_insights)} insights for {insights_schema.kbid}")
        return