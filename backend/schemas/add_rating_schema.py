from pydantic import BaseModel, Field

class AddRatingSchema(BaseModel):
    article_id: str
    rating_value: int = Field(..., ge=1, le=5)
