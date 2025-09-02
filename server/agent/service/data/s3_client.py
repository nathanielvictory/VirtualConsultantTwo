import boto3
from config import settings

if settings.AWS_SECRET_ACCESS_KEY and settings.AWS_ACCESS_KEY_ID:
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )
else:
    s3_client = boto3.client("s3", region_name=settings.AWS_REGION)
