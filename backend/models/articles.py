from pydantic import BaseModel
from typing import Literal

class Article(BaseModel):
    article_title: str
    article_preview: str
    article_content: str
    article_tag: Literal["office", "budget", "gaming", "flagship"]
    article_image: bytes