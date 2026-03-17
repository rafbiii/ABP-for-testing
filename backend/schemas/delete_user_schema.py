from pydantic import BaseModel

class DeleteUserRequest(BaseModel):
    user_id: str
