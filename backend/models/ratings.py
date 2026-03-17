from pydantic import BaseModel
from typing import Literal

class Rating(BaseModel):
    article_id: str
    owner: str
    rating_value: Literal[1, 2, 3, 4, 5]