from pydantic import BaseModel

class EditCommentRequest(BaseModel):
    article_id: str
    comment_id: str
    parent_comment_id: str | None = None
    comment_content: str
