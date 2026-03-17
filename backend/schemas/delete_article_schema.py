from pydantic import BaseModel

class DeleteArticleRequest(BaseModel):
    article_id: str
