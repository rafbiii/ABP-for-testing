from fastapi import APIRouter, Depends
from schemas.edit_article_get_schema import EditArticleGetRequest
from schemas.edit_article_update_schema import EditArticleUpdateRequest
from schemas.view_article_schema import ViewArticleRequest
from services.rating_service import RatingService
from services.comment_service import CommentService
from services.article_service import ArticleService
from services.auth_service import AuthService
from utils.base64_utils import base64_to_bytes, bytes_to_base64
from schemas.delete_article_schema import DeleteArticleRequest
from bson import ObjectId, errors
from db.connection import db
from schemas.add_article_schema import AddArticle
from core.dependencies import get_current_user

router = APIRouter()

@router.post("/edit/get")
async def edit_get_article(req: EditArticleGetRequest, payload: dict = Depends(get_current_user)):
    article = await ArticleService.fetch_article(req.article_id)
    if article is None:
        return {"confirmation": "backend error"}

    if not AuthService.is_admin(payload):
        return {"confirmation": "not admin"}

    image_base64 = None
    if article.get("article_image"):
        image_base64 = bytes_to_base64(bytes(article["article_image"]))

    return {
        "confirmation": "successful",
        "article_id": str(article["_id"]),
        "article_title": article["article_title"],
        "article_preview": article["article_preview"],
        "article_content": article["article_content"],
        "article_tag": article["article_tag"],
        "article_image": image_base64
    }


@router.post("/edit/update")
async def edit_update_article(req: EditArticleUpdateRequest, payload: dict = Depends(get_current_user)):
    article = await ArticleService.fetch_article(req.article_id)
    if article is None:
        return {"confirmation": "backend error"}

    if not (1 <= len(req.article_title) <= 256):
        return {"confirmation": "Title must be 1-256 characters long."}

    if not (1 <= len(req.article_preview) <= 128):
        return {"confirmation": "Preview must be 1-128 characters long."}

    if not (1 <= len(req.article_content) <= 65536):
        return {"confirmation": "Content must be 1-65536 characters long."}

    allowed_tags = ["office", "budget", "gaming", "flagship"]
    if req.article_tag not in allowed_tags:
        return {"confirmation": "Invalid article tag."}

    try:
        image_bytes = base64_to_bytes(req.article_image)
    except Exception:
        return {"confirmation": "invalid image format"}

    result = await ArticleService.update_article(req, image_bytes)

    if result == "invalid_image":
        return {"confirmation": "invalid image format"}

    if not result:
        return {"confirmation": "backend error"}

    return {
        "confirmation": "successful: article edited",
        "article_id": req.article_id
    }


@router.post("/view")
async def view_article(req: ViewArticleRequest, payload: dict = Depends(get_current_user)):
    article = await ArticleService.fetch_article(req.article_id)
    if article is None:
        return {"confirmation": "backend error"}

    if article.get("is_deleted"):
        return {"confirmation": "backend error"}

    user_email = payload.get("email")
    user = await db.user.find_one({"email": user_email})
    userclass = "admin" if AuthService.is_admin(payload) else "user"

    image_base64 = None
    if article.get("article_image"):
        try:
            image_base64 = bytes_to_base64(bytes(article["article_image"]))
        except:
            image_base64 = None

    comments_raw = await CommentService.get_comments(req.article_id)
    if comments_raw is None:
        return {"confirmation": "backend error"}

    comments = []
    for c in comments_raw:
        try:
            u = await db.user.find_one({"_id": ObjectId(c["owner_id"])})
        except:
            u = None
        comments.append({
            "comment_id": str(c["_id"]),
            "parent_comment_id": c.get("parent_comment_id"),
            "owner": u["username"] if u else "Unknown",
            "user_email": u["email"] if u else None,
            "comment_content": c["comment_content"]
        })

    ratings_raw = await RatingService.get_ratings(req.article_id)
    if ratings_raw is None:
        return {"confirmation": "backend error"}

    ratings = []
    for r in ratings_raw:
        try:
            u = await db.user.find_one({"_id": ObjectId(r["owner_id"])})
        except:
            u = None
        ratings.append({
            "rating_id": str(r["_id"]),
            "owner": u["username"] if u else "Unknown",
            "user_email": u["email"] if u else None,
            "rating_value": r["rating_value"]
        })

    reports_raw = await db.report_article.find({"article_id": ObjectId(req.article_id)}).to_list(None)
    reports = [{"report_id": str(rep["_id"]), "description": rep["description"], "created_at": rep.get("created_at")} for rep in reports_raw]

    return {
        "confirmation": "successful",
        "userclass": userclass,
        "user_email": user_email,
        "username": user["username"],
        "article_title": article["article_title"],
        "article_content": article["article_content"],
        "article_tag": article["article_tag"],
        "article_image": image_base64,
        "comments": comments,
        "ratings": ratings,
        "reports": reports
    }


@router.post("/delete")
async def delete_article(req: DeleteArticleRequest, payload: dict = Depends(get_current_user)):
    try:
        article_oid = ObjectId(req.article_id)
    except errors.InvalidId:
        return {"confirmation": "backend error"}

    article = await ArticleService.fetch_article(req.article_id)
    if article is None:
        return {"confirmation": "backend error"}

    if not AuthService.is_admin(payload):
        return {"confirmation": "not admin"}

    try:
        result = await db.article.update_one(
            {"_id": article_oid},
            {"$set": {"is_deleted": True}}
        )
    except:
        return {"confirmation": "backend error"}

    if result.modified_count == 0:
        return {"confirmation": "backend error"}

    return {"confirmation": "successful: article deleted"}


@router.post("/main_page")
async def main_page(payload: dict = Depends(get_current_user)):
    user_email = payload.get("email")
    user = await db.user.find_one({"email": user_email})

    if not user:
        return {"confirmation": "token invalid"}

    username = user.get("username", "")

    try:
        cursor = db.article.find({"is_deleted": False})
        articles = await cursor.to_list(length=None)
    except Exception:
        return {"confirmation": "backend error"}

    list_article = []
    for a in articles:
        list_article.append({
            "article_id": str(a["_id"]),
            "article_title": a.get("article_title"),
            "article_preview": a.get("article_preview"),
            "article_tag": a.get("article_tag"),
            "article_image": a.get("article_image").decode("latin1") if a.get("article_image") else None
        })

    return {
        "confirmation": "fetch data successful",
        "username": username,
        "list_article": list_article
    }


@router.post("/verification")
async def verification(payload: dict = Depends(get_current_user)):
    if not AuthService.is_admin(payload):
        return {"confirmation": "not admin"}
    return {"confirmation": "successful"}


@router.post("/add")
async def add_article(req: AddArticle, payload: dict = Depends(get_current_user)):
    if not AuthService.is_admin(payload):
        return {"confirmation": "not admin"}

    user_email = payload.get("email")
    user = await db.user.find_one({"email": user_email})
    if not user:
        return {"confirmation": "token invalid"}

    author_id = str(user["_id"])

    if not (1 <= len(req.article_title) <= 256):
        return {"confirmation": "Title must be 1-256 characters long."}

    if not (1 <= len(req.article_preview) <= 128):
        return {"confirmation": "Preview must be 1-128 characters long."}

    if not (1 <= len(req.article_content) <= 65536):
        return {"confirmation": "Content must be 1-65536 characters long."}

    allowed_tags = ["office", "budget", "gaming", "flagship"]
    if req.article_tag not in allowed_tags:
        return {"confirmation": "Invalid article tag."}

    try:
        image_bytes = base64_to_bytes(req.article_image)
    except Exception:
        return {"confirmation": "Image format must be valid Base64."}

    article_id = await ArticleService.add_article(
        req.article_title,
        req.article_preview,
        req.article_content,
        req.article_tag,
        image_bytes,
        author_id
    )

    if article_id is None:
        return {"confirmation": "backend error"}

    return {"confirmation": "success: article added"}
