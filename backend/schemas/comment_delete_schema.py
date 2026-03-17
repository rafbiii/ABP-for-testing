from pydantic import BaseModel

class DeleteCommentRequest(BaseModel):
    comment_id: str
