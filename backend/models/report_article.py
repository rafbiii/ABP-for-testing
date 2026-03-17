from pydantic import BaseModel

class ReportArticle(BaseModel):
    article_id: str
    description: str