from pydantic import BaseModel, EmailStr

class GetUserProfileRequest(BaseModel):
    user_email: EmailStr
