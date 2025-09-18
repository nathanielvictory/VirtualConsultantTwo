from dataclasses import dataclass


@dataclass
class Artifact:
    resource_type: str
    action: str
    total_tokens: int
    created_resource_id: int | None = None

    def to_json(self):
        json = {
            "resourceType": self.resource_type,
            "action": self.action,
            "totalTokens": self.total_tokens,
        }
        if self.created_resource_id is not None:
            json["createdResourceId"] = self.created_resource_id
        return json
