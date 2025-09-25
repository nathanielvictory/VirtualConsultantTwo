from datetime import datetime, timezone

from config import settings
from .artifact_schema import Artifact
from .auth import ConsultantAuth
import requests

class _State:
    def __init__(self, task_id):
        self.artifacts: list[Artifact] = []
        self.data = {}
        self._auth = ConsultantAuth()
        self._progress = 0
        self._total_progress = None
        self.task_id = task_id

    @staticmethod
    def get_current_timestamp():
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def get_base_url():
        return settings.CONSULTANT_URL


    def add_artifact(self, a: Artifact):
        self.artifacts.append(a)


    def get_token(self): return (
        self._auth.get_token())


    def get_headers(self):
        return {
            'Authorization': f'Bearer {self.get_token()}'
        }


    def reset_progress_total(self, total: int):
        self._total_progress = total
        self._progress = 0
        self._set_task_progress(0)


    def increment_progress(self):
        self._progress += 1
        self._set_task_progress(self._progress * 100 // self._total_progress)


    def _set_task_progress(self, percent: int):
        if percent <= 0:
            percent = 1
        if percent >= 100:
            percent = 99

        headers = self.get_headers()
        data = {'progress': percent}

        response = requests.patch(settings.CONSULTANT_URL + f'/Tasks/{self.task_id}', headers=headers, json=data)
        if True:
            pass