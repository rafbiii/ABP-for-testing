from pydantic import BaseModel

class EditRatingGetRequest(BaseModel):
    article_id: str
    rating_id: str
