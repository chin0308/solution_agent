"""Document parsing utilities for uploaded architecture requirements."""

from __future__ import annotations

from enum import Enum
from io import BytesIO
from typing import Tuple

try:
    from docx import Document
except Exception:  # pragma: no cover - optional dependency
    Document = None

try:
    from pypdf import PdfReader
except Exception:  # pragma: no cover - optional dependency
    PdfReader = None


class DocumentType(str, Enum):
    PDF = "pdf"
    DOCX = "docx"
    TXT = "txt"
    UNKNOWN = "unknown"


class DocumentParser:
    @staticmethod
    def parse(file_bytes: bytes, filename: str) -> Tuple[str, DocumentType]:
        extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

        if extension == "pdf":
            return DocumentParser._parse_pdf(file_bytes), DocumentType.PDF
        if extension == "docx":
            return DocumentParser._parse_docx(file_bytes), DocumentType.DOCX
        if extension == "txt":
            return DocumentParser._parse_txt(file_bytes), DocumentType.TXT

        return DocumentParser._parse_txt(file_bytes), DocumentType.UNKNOWN

    @staticmethod
    def _parse_pdf(file_bytes: bytes) -> str:
        if PdfReader is None:
            return DocumentParser._parse_txt(file_bytes)

        reader = PdfReader(BytesIO(file_bytes))
        pages = []
        for page in reader.pages:
            pages.append(page.extract_text() or "")
        return "\n".join(pages).strip()

    @staticmethod
    def _parse_docx(file_bytes: bytes) -> str:
        if Document is None:
            return DocumentParser._parse_txt(file_bytes)

        document = Document(BytesIO(file_bytes))
        paragraphs = [paragraph.text for paragraph in document.paragraphs if paragraph.text]
        return "\n".join(paragraphs).strip()

    @staticmethod
    def _parse_txt(file_bytes: bytes) -> str:
        for encoding in ("utf-8", "utf-8-sig", "cp1252", "latin-1"):
            try:
                return file_bytes.decode(encoding).strip()
            except UnicodeDecodeError:
                continue
        return file_bytes.decode("utf-8", errors="ignore").strip()


__all__ = ["DocumentParser", "DocumentType"]
