from pydantic import BaseModel, EmailStr

class User(BaseModel):
    username: str
    fullname: str
    email: EmailStr
    password: str