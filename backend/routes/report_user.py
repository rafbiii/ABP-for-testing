from fastapi import APIRouter, Depends
from schemas.get_user_profile_schema import GetUserProfileRequest
from schemas.report_user_schema import ReportUserRequest
from services.report_user_service import ReportUserService
from db.connection import db
from core.dependencies import get_current_user

router = APIRouter()

@router.post("/get_user_profile")
async def get_user_profile(req: GetUserProfileRequest, payload: dict = Depends(get_current_user)):
    try:
        await db.command("ping")
    except Exception as e:
        return {"confirmation": "backend error"}

    try:
        user = await db.user.find_one({"email": req.user_email})
    except Exception as e:
        return {"confirmation": "backend error"}

    if not user:
        return {"confirmation": "user not found"}

    created_at = user.get("created_at")
    if created_at:
        try:
            created_at = created_at.isoformat()
        except:
            pass

    return {
        "confirmation": "successful",
        "user": {
            "user_email": user.get("email", ""),
            "username": user.get("username", ""),
            "fullname": user.get("fullname", ""),
            "role": user.get("role", "user"),
            "created_at": created_at
        }
    }


@router.post("/report_user")
async def report_user(req: ReportUserRequest, payload: dict = Depends(get_current_user)):
    try:
        await db.command("ping")
    except Exception as e:
        return {"confirmation": "backend error"}

    reporter_email = payload.get("email")
    if reporter_email is None:
        return {"confirmation": "token invalid"}

    if reporter_email == req.reported_user_email:
        return {"confirmation": "cannot report self"}

    try:
        reported_user = await db.user.find_one({"email": req.reported_user_email})
    except Exception as e:
        return {"confirmation": "backend error"}

    if not reported_user:
        return {"confirmation": "user not found"}

    reported_user_oid = reported_user.get("_id")

    save_ok = await ReportUserService.save_report(reported_user_oid, req.description)
    if not save_ok:
        return {"confirmation": "backend error"}

    incr_ok = await ReportUserService.increment_report_count(str(reported_user_oid))
    if not incr_ok:
        return {"confirmation": "backend error"}

    return {"confirmation": "successful: user reported"}
