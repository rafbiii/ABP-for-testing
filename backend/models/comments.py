from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Comment(BaseModel):
    comment_id: Optional[str] = None
    article_id: Optional[str] = None
    owner: Optional[str] = None
    parent_comment_id: Optional[str] = None
    comment_content: Optional[str] = None
    created_at: datetime = datetime.utcnow()