from pydantic import BaseModel

class ViewArticleRequest(BaseModel):
    article_id: str
