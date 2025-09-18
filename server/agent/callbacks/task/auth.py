import time
import requests
from config import settings

class ConsultantAuth:
    def __init__(self):
        self._access_token: str | None = None
        self._expiration: float = 0.0

    def _fetch_new_token(self):
        url = f"{settings.CONSULTANT_URL}/Auth/token"
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = {
            "username": settings.CONSULTANT_USERNAME,
            "password": settings.CONSULTANT_PASSWORD,
            "grant_type": "password"
        }

        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()

        payload = response.json()
        self._access_token = payload["access_token"]
        expires_in = payload["expires_in"]
        self._expiration = time.monotonic() + expires_in - 60

    def _is_expired(self) -> bool:
        return time.monotonic() >= self._expiration

    def get_token(self) -> str:
        if not self._access_token or self._is_expired():
            self._fetch_new_token()
        return self._access_token
