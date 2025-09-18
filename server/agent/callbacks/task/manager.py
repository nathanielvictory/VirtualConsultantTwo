from contextlib import contextmanager
import requests
from logging import getLogger
from datetime import datetime, timezone

from config import settings
from .artifact_schema import Artifact
from .auth import ConsultantAuth


@contextmanager
def TaskManager(task_id):
    class _State:
        def __init__(self):
            self.artifacts: list[Artifact] = []
            self.data = {}
            self._auth = ConsultantAuth()
        def add_artifact(self, a: Artifact): self.artifacts.append(a)
        def get_token(self): return self._auth.get_token()

        @staticmethod
        def get_base_url(): return settings.CONSULT_BASE_URL

        def get_headers(self):
            return {
                'Authorization': f'Bearer {self.get_token()}'
            }

        @staticmethod
        def get_current_timestamp(): return datetime.now(timezone.utc).isoformat()


    logger = getLogger(__name__)
    state = _State()
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
