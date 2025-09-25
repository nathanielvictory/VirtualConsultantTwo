from typing import Protocol

class ProgressCallback(Protocol):
    def reset_progress_total(self, total: int) -> None:
        ...

    def increment_progress(self) -> None:
        ...