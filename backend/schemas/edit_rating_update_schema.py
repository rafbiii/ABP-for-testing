from pydantic import BaseModel

class EditRatingUpdateRequest(BaseModel):
    article_id: str
    rating_id: str
    rating_value: int
