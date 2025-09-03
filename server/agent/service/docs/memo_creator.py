from typing import List, Dict, Any
from google.oauth2 import service_account
from googleapiclient.discovery import build


class MemoCreator:
    """
    Minimal wrapper for Google Docs:
      - read_all_text(): str
      - append_text(text): None

    Usage:
        mc = MemoCreator(
            document_id="your-doc-id",
            creds_path="service_account.json"
        )
        text = mc.read_all_text()
        mc.append_text("New line at the end!")
    """

    def __init__(self, document_id: str, creds_path: str = "service_account.json"):
        # Docs write scope; include Drive read-only so the service account can read the file
        SCOPES = [
            "https://www.googleapis.com/auth/documents",
            "https://www.googleapis.com/auth/drive.readonly",
        ]
        creds = service_account.Credentials.from_service_account_file(
            creds_path, scopes=SCOPES
        )
        self.docs = build("docs", "v1", credentials=creds, cache_discovery=False)
        self.document_id = document_id

    # ── Public API ────────────────────────────────────────────────────────────
    def read_all_text(self) -> str:
        """Return all visible text in the document, including text inside tables and TOCs."""
        doc = self.docs.documents().get(documentId=self.document_id).execute()
        body = doc.get("body", {})
        content = body.get("content", [])
        return self._read_structural_elements(content)

    def append_text(self, text: str) -> None:
        """
        Append text at the end of the document.
        The Google Docs model ends with a newline; we insert at (endIndex - 1).
        """
        # Fetch to get the current end index
        doc = self.docs.documents().get(documentId=self.document_id).execute()
        body = doc.get("body", {})
        content = body.get("content", [])
        if not content:
            # Empty doc — the end index is 1 (just the ending newline)
            end_index = 1
        else:
            # The last structural element holds the document's total endIndex
            end_index = content[-1].get("endIndex", 1)

        # Ensure we end with a newline so the next append starts on a fresh line.
        to_insert = text if text.endswith("\n") else text + "\n"

        requests = [
            {
                "insertText": {
                    "location": {"index": end_index - 1},
                    "text": to_insert,
                }
            }
        ]

        self.docs.documents().batchUpdate(
            documentId=self.document_id, body={"requests": requests}
        ).execute()

    # ── Internals ─────────────────────────────────────────────────────────────
    def _read_structural_elements(self, elements: List[Dict[str, Any]]) -> str:
        """Recursively extract text from paragraphs, tables, and table of contents."""
        text = []
        for el in elements:
            if "paragraph" in el:
                for pe in el["paragraph"].get("elements", []):
                    tr = pe.get("textRun")
                    if tr:
                        text.append(tr.get("content", ""))
            elif "table" in el:
                for row in el["table"].get("tableRows", []):
                    for cell in row.get("tableCells", []):
                        text.append(self._read_structural_elements(cell.get("content", [])))
            elif "tableOfContents" in el:
                text.append(
                    self._read_structural_elements(el["tableOfContents"].get("content", []))
                )
        return "".join(text)