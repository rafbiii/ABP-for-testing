from pydantic import BaseModel, EmailStr

class ReportUserRequest(BaseModel):
    reported_user_email: EmailStr
    description: str
