import logging
from db.connection import db
from datetime import datetime
from bson import ObjectId

logger = logging.getLogger(__name__)

class CommentService:

    @staticmethod
    async def add_comment(article_id, parent_comment_id, owner_id, comment_content):
        try:
            data = {
                "article_id": article_id,
                "owner_id": owner_id,
                "parent_comment_id": parent_comment_id,
                "comment_content": comment_content,
                "created_at": datetime.utcnow(),
            }
            result = await db.comment.insert_one(data)
            return str(result.inserted_id)
        except Exception as e:
            logger.error("add_comment error: %s", e)
            return None

    @staticmethod
    async def get_comments(article_id):
        try:
            return await db.comment.find({"article_id": article_id}).to_list(None)
        except Exception as e:
            logger.error("get_comments error: %s", e)
            return None

    @staticmethod
    async def edit_comment(article_id: str, comment_id: str, owner_id: str, new_content: str):
        if not (1 <= len(new_content) <= 8192):
            return False

        try:
            comment = await db.comment.find_one({
                "_id": ObjectId(comment_id),
                "article_id": article_id,
                "owner_id": owner_id
            })
        except Exception as e:
            logger.error("edit_comment find error: %s", e)
            return False

        if not comment:
            return False

        try:
            res = await db.comment.update_one(
                {"_id": ObjectId(comment_id)},
                {"$set": {"comment_content": new_content}}
            )
            return res.acknowledged
        except Exception as e:
            logger.error("edit_comment update error: %s", e)
            return False

    @staticmethod
    async def delete_comment_and_children(comment_id: str):
        try:
            to_delete = [comment_id]
            idx = 0
            while idx < len(to_delete):
                current = to_delete[idx]
                children = await db.comment.find(
                    {"parent_comment_id": current}
                ).to_list(None)
                for child in children:
                    to_delete.append(str(child["_id"]))
                idx += 1

            oid_list = [ObjectId(cid) for cid in to_delete]
            await db.comment.delete_many({"_id": {"$in": oid_list}})
            return True
        except Exception as e:
            logger.error("delete_comment_and_children error: %s", e)
            return False
