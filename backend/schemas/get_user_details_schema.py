from pydantic import BaseModel
from typing import Optional

class GetUserDetailsRequest(BaseModel):
    user_email: Optional[str] = None
