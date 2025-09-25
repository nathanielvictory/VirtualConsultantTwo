from contextlib import contextmanager
import requests
from logging import getLogger

from config import settings
from .manager_state import _State


@contextmanager
def TaskManager(task_id):
    logger = getLogger(__name__)
    state = _State(task_id)
    try:
        headers = state.get_headers()
        data = {'status': 'Running', "startedAt": state.get_current_timestamp()}
        requests.patch(settings.CONSULTANT_URL + f'/Tasks/{task_id}', headers=headers, json=data)
        yield state

    except Exception as e:
        logger.exception(f"Task {task_id} failed")
        headers = state.get_headers()
        data = {'status': 'Failed', "errorMessage": str(e)}
        requests.patch(settings.CONSULTANT_URL + f'/Tasks/{task_id}', headers=headers, json=data)
        raise

    else:
        for artifact in state.artifacts:
            headers = state.get_headers()
            data = artifact.to_json()
            requests.post(settings.CONSULTANT_URL + f"/Tasks/{task_id}/artifacts", headers=headers, json=data)
        headers = state.get_headers()
        data = {'status': 'Succeeded', "completedAt": state.get_current_timestamp()}
        requests.patch(settings.CONSULTANT_URL + f'/Tasks/{task_id}', headers=headers, json=data)
