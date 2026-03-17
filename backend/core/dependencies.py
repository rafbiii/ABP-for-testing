from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
import jwt
import os
from jwt import ExpiredSignatureError, InvalidTokenError
from core.exceptions import Unauthorized

oauth = OAuth2PasswordBearer(tokenUrl="/auth/login")

JWT_SECRET = os.getenv("JWT_SECRET", "default_secret")
JWT_ALGO = os.getenv("JWT_ALGO", "HS256")

def get_current_user(token: str = Depends(oauth)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        return payload
    except ExpiredSignatureError:
        raise Unauthorized("Token has expired")
    except InvalidTokenError:
        raise Unauthorized("Invalid token")
