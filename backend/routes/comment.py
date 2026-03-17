from fastapi import APIRouter, Depends
from schemas.add_comment_schema import AddCommentRequest
from schemas.edit_comment_update_schema import EditCommentRequest
from schemas.edit_comment_get_schema import EditCommentGetRequest
from services.comment_service import CommentService
from services.article_service import ArticleService
from services.auth_service import AuthService
from db.connection import db
from bson import ObjectId
from utils.base64_utils import bytes_to_base64
from services.rating_service import RatingService
from schemas.comment_delete_schema import DeleteCommentRequest
from core.dependencies import get_current_user

router = APIRouter()

@router.post("/add")
async def add_comment(req: AddCommentRequest, payload: dict = Depends(get_current_user)):
    if not (1 <= len(req.comment_content) <= 8192):
        return {"confirmation": "backend error"}

    try:
        user = await db.user.find_one({"email": payload.get("email")})
    except:
        return {"confirmation": "backend error"}

    if not user:
        return {"confirmation": "token invalid"}

    owner_id = str(user["_id"])

    article = await ArticleService.fetch_article(req.article_id)
    if article is None:
        return {"confirmation": "backend error"}

    if req.parent_comment_id not in (None, "", "null"):
        try:
            parent = await db.comment.find_one({"_id": ObjectId(req.parent_comment_id)})
        except:
            parent = None
        if parent is None:
            return {"confirmation": "backend error"}

    new_comment_id = await CommentService.add_comment(
        article_id=req.article_id,
        parent_comment_id=req.parent_comment_id if req.parent_comment_id else None,
        owner_id=owner_id,
        comment_content=req.comment_content
    )

    if not new_comment_id:
        return {"confirmation": "backend error"}

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
        "username": user["username"],
        "user_email": payload.get("email"),
        "article_title": article["article_title"],
        "article_content": article["article_content"],
        "article_tag": article["article_tag"],
        "article_image": image_base64,
        "comments": comments,
        "ratings": ratings,
        "reports": reports
    }


@router.post("/edit/update")
async def edit_comment(req: EditCommentRequest, payload: dict = Depends(get_current_user)):
    user_email = payload.get("email")
    user = await db.user.find_one({"email": user_email})
    owner_id = str(user["_id"])

    if req.parent_comment_id:
        try:
            parent_oid = ObjectId(req.parent_comment_id)
        except:
            return {"confirmation": "backend error"}
        parent_exists = await db.comment.find_one({"_id": parent_oid, "article_id": req.article_id})
        if not parent_exists:
            return {"confirmation": "backend error"}

    edit_ok = await CommentService.edit_comment(
        article_id=req.article_id,
        comment_id=req.comment_id,
        owner_id=owner_id,
        new_content=req.comment_content
    )

    if not edit_ok:
        return {"confirmation": "backend error"}

    article = await ArticleService.fetch_article(req.article_id)
    if not article:
        return {"confirmation": "backend error"}

    userclass = "admin" if AuthService.is_admin(payload) else "user"

    try:
        image_base64 = bytes_to_base64(bytes(article.get("article_image"))) if article.get("article_image") else None
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
        "username": user["username"],
        "user_email": user_email,
        "article_title": article["article_title"],
        "article_content": article["article_content"],
        "article_tag": article["article_tag"],
        "article_image": image_base64,
        "comments": comments,
        "ratings": ratings,
        "reports": reports
    }


@router.post("/edit/get")
async def edit_get_comment(req: EditCommentGetRequest, payload: dict = Depends(get_current_user)):
    user_email = payload.get("email")

    try:
        user = await db.user.find_one({"email": user_email})
    except:
        return {"confirmation": "backend error"}

    if not user:
        return {"confirmation": "token invalid"}

    owner_id = str(user["_id"])
    username = user.get("username", "")

    try:
        comment = await db.comment.find_one({"_id": ObjectId(req.comment_id), "owner_id": owner_id})
    except:
        return {"confirmation": "backend error"}

    if not comment:
        return {"confirmation": "backend error"}

    return {
        "confirmation": "successful",
        "comment_id": str(comment["_id"]),
        "article_id": str(comment["article_id"]),
        "user_email": user_email,
        "parent_comment_id": comment.get("parent_comment_id"),
        "comment_content": comment.get("comment_content"),
        "owner": username
    }


@router.post("/delete")
async def delete_comment(req: DeleteCommentRequest, payload: dict = Depends(get_current_user)):
    try:
        comment = await db.comment.find_one({"_id": ObjectId(req.comment_id)})
    except:
        return {"confirmation": "backend error"}

    if comment is None:
        return {"confirmation": "backend error"}

    article_id = str(comment["article_id"])

    try:
        user = await db.user.find_one({"email": payload.get("email")})
    except:
        return {"confirmation": "backend error"}

    if not user:
        return {"confirmation": "token invalid"}

    is_admin = AuthService.is_admin(payload)
    if not is_admin and str(user["_id"]) != str(comment["owner_id"]):
        return {"confirmation": "backend error"}

    deleted = await CommentService.delete_comment_and_children(req.comment_id)
    if not deleted:
        return {"confirmation": "backend error"}

    article = await ArticleService.fetch_article(article_id)
    if article is None:
        return {"confirmation": "backend error"}

    userclass = "admin" if is_admin else "user"

    image_base64 = None
    if article.get("article_image"):
        try:
            image_base64 = bytes_to_base64(bytes(article["article_image"]))
        except:
            image_base64 = None

    comments_raw = await CommentService.get_comments(article_id)
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

    ratings_raw = await RatingService.get_ratings(article_id)
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

    reports_raw = await db.report_article.find({"article_id": ObjectId(article_id)}).to_list(None)
    reports = [{"report_id": str(rep["_id"]), "description": rep["description"], "created_at": rep.get("created_at")} for rep in reports_raw]

    return {
        "confirmation": "successful",
        "userclass": userclass,
        "username": user["username"],
        "user_email": user["email"],
        "article_title": article["article_title"],
        "article_content": article["article_content"],
        "article_tag": article["article_tag"],
        "article_image": image_base64,
        "comments": comments,
        "ratings": ratings,
        "reports": reports
    }
