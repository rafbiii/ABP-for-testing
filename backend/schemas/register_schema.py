from pydantic import BaseModel, EmailStr

class RegisterUser(BaseModel):
    username: str
    fullname: str
    email: EmailStr
    password: str
