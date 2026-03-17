from pydantic import BaseModel
from typing import Optional, Literal

class EditArticleUpdateRequest(BaseModel):
    article_id: str
    article_title: Optional[str] = None
    article_preview: Optional[str] = None
    article_content: Optional[str] = None
    article_tag: Optional[Literal["office", "budget", "gaming", "flagship"]] = None
    article_image: Optional[str] = None
