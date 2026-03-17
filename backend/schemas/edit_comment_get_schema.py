from pydantic import BaseModel

class EditCommentGetRequest(BaseModel):
    comment_id: str
