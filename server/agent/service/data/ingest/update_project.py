import io
import json
import gzip

from config import settings
from service.data.s3_client import s3_client, get_survey_data_key
from ..models.survey import Survey

from ..reporting_api.get_survey_data import get_survey_data


def update_project(kbid: str, key_number: int = 0) -> Survey | None:
    survey_data = get_survey_data(kbid, key_number)
    if not survey_data:
        return None
    survey_dict = survey_data.model_dump()
    s3_key = get_survey_data_key(kbid, key_number)

    buf = io.BytesIO()
    with gzip.GzipFile(fileobj=buf, mode="wb") as gz:
        gz.write(json.dumps(survey_dict).encode())
    buf.seek(0)

    s3_client.upload_fileobj(
        buf,
        settings.AWS_S3_BUCKET,
        s3_key,
        ExtraArgs={"ContentType": "application/json", "ContentEncoding": "gzip"},
    )

    return survey_data