from pydantic import BaseModel
from typing import Optional

class AddCommentRequest(BaseModel):
    article_id: str
    parent_comment_id: Optional[str] = None
    comment_content: str
