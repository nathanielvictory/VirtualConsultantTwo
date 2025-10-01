from pydantic_ai.models.bedrock import BedrockConverseModel
from pydantic_ai.providers.bedrock import BedrockProvider

from config import settings

if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
    model = BedrockConverseModel(
            'openai.gpt-oss-120b-1:0',
             provider=BedrockProvider(
                 region_name='us-west-2',
                 aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                 aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
             )
        )
else:
    model = BedrockConverseModel(
        'openai.gpt-oss-120b-1:0',
        provider=BedrockProvider(
            region_name='us-west-2',
        )
    )