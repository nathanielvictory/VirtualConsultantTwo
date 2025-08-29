from google.oauth2 import service_account
from googleapiclient.discovery import build

SLIDES_SCOPE = "https://www.googleapis.com/auth/presentations"
# Add Drive scope if you also need Drive operations (optional):
# DRIVE_SCOPE = "https://www.googleapis.com/auth/drive"
SCOPES = [SLIDES_SCOPE]  # or [SLIDES_SCOPE, DRIVE_SCOPE]

def get_slides_service(sa_key_path: str):
    creds = service_account.Credentials.from_service_account_file(sa_key_path, scopes=SCOPES)
    return build("slides", "v1", credentials=creds, cache_discovery=False)
