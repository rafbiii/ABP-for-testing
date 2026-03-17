from fastapi import APIRouter, Depends
from schemas.add_rating_schema import AddRatingSchema
from services.auth_service import AuthService
from services.rating_service import RatingService
from schemas.edit_rating_get_schema import EditRatingGetRequest
from schemas.edit_rating_update_schema import EditRatingUpdateRequest
from db.connection import db
from bson import ObjectId
from utils.base64_utils import bytes_to_base64
from core.dependencies import get_current_user

router = APIRouter()

@router.post("/add")
async def add_rating(req: AddRatingSchema, payload: dict = Depends(get_current_user)):
    if not (1 <= req.rating_value <= 5):
        return {"confirmation": "backend error"}

    user = await db.user.find_one({"email": payload.get("email")})
    if not user:
        return {"confirmation": "token invalid"}

    owner_id = str(user["_id"])

    article = await RatingService.fetch_article(req.article_id)
    if article is None or article.get("is_deleted"):
        return {"confirmation": "backend error"}

    already = await RatingService.get_rating_by_user(article_id=req.article_id, owner_id=owner_id)
    if already:
        return {"confirmation": "already rated"}

    new_rating_id = await RatingService.add_rating(
        article_id=req.article_id,
        owner_id=owner_id,
        rating_value=req.rating_value
    )
    if not new_rating_id:
        return {"confirmation": "backend error"}

    userclass = "admin" if AuthService.is_admin(payload) else "user"

    image_base64 = None
    if article.get("article_image"):
        try:
            image_base64 = bytes_to_base64(bytes(article["article_image"]))
        except:
            image_base64 = None

    comments_raw = await RatingService.get_comments(req.article_id)
    comments = []
    for c in comments_raw:
        u = await db.user.find_one({"_id": ObjectId(c["owner_id"])})
        comments.append({
            "comment_id": str(c["_id"]),
            "parent_comment_id": c.get("parent_comment_id"),
            "owner": u["username"] if u else "Unknown",
            "user_email": u["email"] if u else None,
            "comment_content": c["comment_content"]
        })

    ratings_raw = await RatingService.get_ratings(req.article_id)
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


@router.post("/edit/get")
async def edit_rating_get(req: EditRatingGetRequest, payload: dict = Depends(get_current_user)):
    user = await db.user.find_one({"email": payload.get("email")})
    if not user:
        return {"confirmation": "token invalid"}

    try:
        rating = await db.rating.find_one({
            "_id": ObjectId(req.rating_id),
            "article_id": req.article_id,
            "owner_id": str(user["_id"])
        })
        if not rating:
            return {"confirmation": "backend error"}

        return {
            "confirmation": "successful",
            "rating": {
                "rating_id": str(rating["_id"]),
                "article_id": rating["article_id"],
                "owner_id": rating["owner_id"],
                "user_email": payload.get("email"),
                "rating_value": rating["rating_value"],
                "created_at": rating["created_at"]
            }
        }
    except Exception:
        return {"confirmation": "backend error"}


@router.post("/edit/update")
async def edit_rating_update(req: EditRatingUpdateRequest, payload: dict = Depends(get_current_user)):
    if not (1 <= req.rating_value <= 5):
        return {"confirmation": "backend error"}

    user = await db.user.find_one({"email": payload.get("email")})
    if not user:
        return {"confirmation": "token invalid"}

    rating = await RatingService.get_rating_by_id(req.rating_id)
    if rating is None:
        return {"confirmation": "backend error"}

    if str(rating["owner_id"]) != str(user["_id"]):
        return {"confirmation": "backend error"}

    if req.rating_value != rating["rating_value"]:
        updated = await RatingService.update_rating(req.rating_id, req.rating_value)
        if not updated:
            return {"confirmation": "backend error"}

    article = await RatingService.fetch_article(req.article_id)
    if not article:
        return {"confirmation": "backend error"}

    userclass = "admin" if AuthService.is_admin(payload) else "user"

    try:
        image_base64 = bytes_to_base64(bytes(article["article_image"])) if article.get("article_image") else None
    except:
        image_base64 = None

    comments_raw = await RatingService.get_comments(req.article_id)
    comments = []
    for c in comments_raw:
        u = await db.user.find_one({"_id": ObjectId(c["owner_id"])})
        comments.append({
            "comment_id": str(c["_id"]),
            "parent_comment_id": c.get("parent_comment_id"),
            "owner": u["username"] if u else "Unknown",
            "user_email": u["email"] if u else None,
            "comment_content": c["comment_content"]
        })

    ratings_raw = await RatingService.get_ratings(req.article_id)
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
