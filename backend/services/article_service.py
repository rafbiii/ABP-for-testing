import logging
from db.connection import db
from bson import ObjectId, Binary
from utils.image_validator import validate_image_bytes
from datetime import datetime

logger = logging.getLogger(__name__)

class ArticleService:

    @staticmethod
    async def fetch_article(article_id: str):
        try:
            return await db.article.find_one({
                "_id": ObjectId(article_id),
                "is_deleted": False
            })
        except Exception as e:
            logger.error("fetch_article error: %s", e)
            return None

    @staticmethod
    async def update_article(data, image_bytes: bytes):
        update_fields = {}

        if data.article_title is not None:
            update_fields["article_title"] = data.article_title
        if data.article_preview is not None:
            update_fields["article_preview"] = data.article_preview
        if data.article_content is not None:
            update_fields["article_content"] = data.article_content
        if data.article_tag is not None:
            update_fields["article_tag"] = data.article_tag

        if image_bytes is not None:
            if not validate_image_bytes(image_bytes):
                return "invalid_image"
            update_fields["article_image"] = Binary(image_bytes)

        update_fields["updated_at"] = datetime.utcnow()

        try:
            result = await db.article.update_one(
                {"_id": ObjectId(data.article_id)},
                {"$set": update_fields}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error("update_article error: %s", e)
            return False

    @staticmethod
    async def add_article(title, preview, content, tag, image_bytes, author_id):
        try:
            now = datetime.utcnow()
            doc = {
                "article_title": title,
                "article_preview": preview,
                "article_content": content,
                "article_tag": tag,
                "article_image": image_bytes,
                "author_id": author_id,
                "report_count": 0,
                "created_at": now,
                "updated_at": now,
                "is_deleted": False
            }
            result = await db.article.insert_one(doc)
            if result.inserted_id:
                return str(result.inserted_id)
            return None
        except Exception as e:
            logger.error("add_article error: %s", e)
            return None

    @staticmethod
    async def get_ratings(article_id: str):
        try:
            return await db.ratings.find({"article_id": article_id}).to_list(None)
        except Exception as e:
            logger.error("get_ratings error: %s", e)
            return None
