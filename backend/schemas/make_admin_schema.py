from pydantic import BaseModel

class MakeAdminRequest(BaseModel):
    user_id: str
