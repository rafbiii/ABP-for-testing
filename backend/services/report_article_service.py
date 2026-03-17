import logging
from db.connection import db
from bson import ObjectId
from datetime import datetime

logger = logging.getLogger(__name__)

class ReportArticleService:

    @staticmethod
    async def add_report(article_id: str, description: str):
        try:
            data = {
                "article_id": ObjectId(article_id),
                "description": description,
                "created_at": datetime.utcnow()
            }
            result = await db.report_article.insert_one(data)
            await db.article.update_one(
                {"_id": ObjectId(article_id)},
                {"$inc": {"report_count": 1}}
            )
            return str(result.inserted_id)
        except Exception as e:
            logger.error("add_report error: %s", e)
            return None
