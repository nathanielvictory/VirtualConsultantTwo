import logging
from pydantic import ValidationError
import requests
from datetime import datetime, timezone


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

        for index, insight in enumerate(new_insights):
            logger.info(f"{index+1}. {insight}")

        return
        if not success:
            logger.info(f"Failed to update project data for {insights_schema.kbid}")
            return

        logger.info(f"Updated project data for {insights_schema.kbid}")
        headers = task_manager.get_headers()
        data = {"lastRefreshed": task_manager.get_current_timestamp()}
        requests.patch(settings.CONSULTANT_URL + f'/Projects/{insights_schema.project_id}', headers=headers, json=data)
        return