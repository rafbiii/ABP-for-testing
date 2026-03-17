import logging
from db.connection import db
from bson import ObjectId
from services.comment_service import CommentService

logger = logging.getLogger(__name__)

class UserService:

    @staticmethod
    async def get_all_users():
        try:
            return await db.user.find({}).to_list(length=None)
        except Exception as e:
            logger.error("get_all_users error: %s", e)
            return None

    @staticmethod
    async def get_user_by_id(user_id: str):
        try:
            return await db.user.find_one({"_id": ObjectId(user_id)})
        except Exception as e:
            logger.error("get_user_by_id error: %s", e)
            return None

    @staticmethod
    async def get_reports_for_user(user_id: str):
        try:
            return await db.report_user.find(
                {"reported_user_id": ObjectId(user_id)}
            ).to_list(length=None)
        except Exception as e:
            logger.error("get_reports_for_user error: %s", e)
            return None

    @staticmethod
    async def delete_user(user_id: str):
        try:
            user_oid = ObjectId(user_id)

            user_comments = await db.comment.find({"owner_id": user_id}).to_list(None)
            for c in user_comments:
                await CommentService.delete_comment_and_children(str(c["_id"]))

            await db.rating.delete_many({"owner_id": user_id})
            await db.report_user.delete_many({"reported_user_id": user_oid})

            result = await db.user.delete_one({"_id": user_oid})
            return result.deleted_count == 1
        except Exception as e:
            logger.error("delete_user error: %s", e)
            return False

    @staticmethod
    async def make_admin(user_id: str):
        try:
            result = await db.user.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"role": "admin"}}
            )
            return result.modified_count == 1
        except Exception as e:
            logger.error("make_admin error: %s", e)
            return False

    @staticmethod
    async def get_user_by_email(email: str):
        try:
            return await db.user.find_one({"email": email})
        except Exception as e:
            logger.error("get_user_by_email error: %s", e)
            return None
