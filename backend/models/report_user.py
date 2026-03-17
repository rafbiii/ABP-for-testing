from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportUser(BaseModel):
    reported_user_id: str
    description: str
    created_at: Optional[datetime] = None