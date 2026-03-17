import logging
from db.connection import db
from bson import ObjectId
from datetime import datetime

logger = logging.getLogger(__name__)

class ReportUserService:

    @staticmethod
    async def fetch_user_by_email(email: str):
        try:
            return await db.user.find_one({"email": email})
        except Exception as e:
            logger.error("fetch_user_by_email error: %s", e)
            return None

    @staticmethod
    async def save_report(reported_user_id: ObjectId, description: str):
        try:
            doc = {
                "reported_user_id": reported_user_id,
                "description": description,
                "created_at": datetime.utcnow()
            }
            res = await db.report_user.insert_one(doc)
            if res.inserted_id:
                return str(res.inserted_id)
            return None
        except Exception as e:
            logger.error("save_report error: %s", e)
            return None

    @staticmethod
    async def increment_report_count(user_oid_str: str):
        try:
            result = await db.user.update_one(
                {"_id": ObjectId(user_oid_str)},
                {"$inc": {"report_count": 1}}
            )
            return result.modified_count > 0 or result.matched_count > 0
        except Exception as e:
            logger.error("increment_report_count error: %s", e)
            return False
