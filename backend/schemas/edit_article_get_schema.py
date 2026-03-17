from pydantic import BaseModel

class EditArticleGetRequest(BaseModel):
    article_id: str
