from dataclasses import dataclass
from typing import Any

@dataclass
class Artifact:
    resource_type: str
    action: str
    total_tokens: int
    created_resource_id: int | None = None
    payload: dict | None = None

    def to_json(self):
        json: dict[str, Any] = {
            "resourceType": self.resource_type,
            "action": self.action,
            "totalTokens": self.total_tokens,
        }
        if self.created_resource_id is not None:
            json["createdResourceId"] = self.created_resource_id
        if self.payload is not None:
            json["payload"] = self.payload
        return json
