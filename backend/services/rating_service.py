import logging
from db.connection import db
from datetime import datetime
from bson import ObjectId

logger = logging.getLogger(__name__)

class RatingService:

    @staticmethod
    async def add_rating(article_id, owner_id, rating_value):
        try:
            result = await db.rating.insert_one({
                "article_id": article_id,
                "owner_id": owner_id,
                "rating_value": rating_value,
                "created_at": datetime.utcnow()
            })
            return str(result.inserted_id)
        except Exception as e:
            logger.error("add_rating error: %s", e)
            return None

    @staticmethod
    async def get_rating_by_user(article_id, owner_id):
        try:
            return await db.rating.find_one({"article_id": article_id, "owner_id": owner_id})
        except Exception as e:
            logger.error("get_rating_by_user error: %s", e)
            return None

    @staticmethod
    async def get_ratings(article_id):
        try:
            return await db.rating.find({"article_id": article_id}).to_list(None)
        except Exception as e:
            logger.error("get_ratings error: %s", e)
            return None

    @staticmethod
    async def fetch_article(article_id):
        try:
            return await db.article.find_one({"_id": ObjectId(article_id)})
        except Exception as e:
            logger.error("fetch_article error: %s", e)
            return None

    @staticmethod
    async def get_comments(article_id):
        try:
            return await db.comment.find({"article_id": article_id}).to_list(None)
        except Exception as e:
            logger.error("get_comments error: %s", e)
            return None

    @staticmethod
    async def get_rating_by_id(rating_id):
        try:
            return await db.rating.find_one({"_id": ObjectId(rating_id)})
        except Exception as e:
            logger.error("get_rating_by_id error: %s", e)
            return None

    @staticmethod
    async def update_rating(rating_id, new_value):
        try:
            result = await db.rating.update_one(
                {"_id": ObjectId(rating_id)},
                {"$set": {"rating_value": new_value}}
            )
            return result.modified_count == 1
        except Exception as e:
            logger.error("update_rating error: %s", e)
            return False
