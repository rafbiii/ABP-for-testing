import logging
from core.security import verify_password, hash_password, create_token
from db.connection import db
from datetime import datetime

logger = logging.getLogger(__name__)

class AuthService:
    @staticmethod
    async def register(data):
        existing_email = await db.user.find_one({"email": data.email})
        if existing_email:
            return {"confirmation": "email already registered"}

        hashed_pw = hash_password(data.password)
        now = datetime.utcnow()

        new_user = {
            "username": data.username,
            "fullname": data.fullname,
            "email": data.email,
            "password": hashed_pw,
            "role": "user",
            "report_count": 0,
            "created_at": now,
            "updated_at": now,
        }

        await db.user.insert_one(new_user)
        return {"confirmation": "register successful"}

    @staticmethod
    async def login(data):
        try:
            user = await db.user.find_one({"email": data.email})
        except Exception as e:
            logger.error("login db error: %s", e)
            return {"confirmation": "backend error"}

        if not user:
            return {"confirmation": "email doesn't exist"}

        if not verify_password(data.password, user["password"]):
            return {"confirmation": "password incorrect"}

        token = create_token({"email": user["email"], "role": user.get("role", "user")})
        return {"confirmation": "login successful", "token": token}

    @staticmethod
    def is_admin(payload: dict) -> bool:
        return payload.get("role") == "admin"
