from fastapi import APIRouter, Depends
from schemas.get_user_details_schema import GetUserDetailsRequest
from schemas.make_admin_schema import MakeAdminRequest
from schemas.delete_user_schema import DeleteUserRequest
from services.user_service import UserService
from services.auth_service import AuthService
from core.dependencies import get_current_user

router = APIRouter()

@router.post("/get_all")
async def get_all_users(payload: dict = Depends(get_current_user)):
    if not AuthService.is_admin(payload):
        return {"confirmation": "not admin"}

    users_raw = await UserService.get_all_users()
    if users_raw is None:
        return {"confirmation": "backend error"}

    users = [{
        "user_id": str(u["_id"]),
        "username": u.get("username"),
        "email": u.get("email"),
        "fullname": u.get("fullname"),
        "role": u.get("role"),
        "report_count": u.get("report_count", 0),
        "created_at": u.get("created_at")
    } for u in users_raw]

    return {"confirmation": "successful", "users": users}


@router.post("/get_details")
async def get_user_details(req: GetUserDetailsRequest, payload: dict = Depends(get_current_user)):
    is_admin = AuthService.is_admin(payload)
    token_user_email = payload.get("email")

    if is_admin:
        target_user_email = req.user_email if req.user_email else token_user_email
    else:
        if req.user_email and req.user_email != token_user_email:
            return {"confirmation": "backend error"}
        target_user_email = token_user_email

    user = await UserService.get_user_by_email(target_user_email)
    if user is None:
        return {"confirmation": "user not found"}

    reports = []
    if is_admin:
        reports_raw = await UserService.get_reports_for_user(str(user["_id"]))
        if reports_raw is None:
            return {"confirmation": "backend error"}
        reports = [{
            "report_id": str(r["_id"]),
            "user_id": str(r["reported_user_id"]),
            "description": r.get("description"),
            "created_at": r.get("created_at")
        } for r in reports_raw]

    response = {
        "confirmation": "successful",
        "user": {
            "user_id": str(user["_id"]),
            "username": user.get("username"),
            "email": user.get("email"),
            "fullname": user.get("fullname"),
            "role": user.get("role"),
            "created_at": user.get("created_at"),
            "updated_at": user.get("updated_at")
        }
    }

    if is_admin:
        response["user"]["reports"] = reports

    return response


@router.post("/delete")
async def delete_user(req: DeleteUserRequest, payload: dict = Depends(get_current_user)):
    if not AuthService.is_admin(payload):
        return {"confirmation": "not admin"}

    user = await UserService.get_user_by_id(req.user_id)
    if user is None:
        return {"confirmation": "user not found"}

    if user.get("role") == "admin":
        return {"confirmation": "cannot delete admin"}

    success = await UserService.delete_user(req.user_id)
    if not success:
        return {"confirmation": "backend error"}

    return {"confirmation": "successful: user deleted"}


@router.post("/make_admin")
async def make_admin(req: MakeAdminRequest, payload: dict = Depends(get_current_user)):
    if not AuthService.is_admin(payload):
        return {"confirmation": "not admin"}

    user = await UserService.get_user_by_id(req.user_id)
    if user is None:
        return {"confirmation": "user not found"}

    if user.get("role") == "admin":
        return {"confirmation": "already admin"}

    success = await UserService.make_admin(req.user_id)
    if not success:
        return {"confirmation": "backend error"}

    return {"confirmation": "successful: role updated to admin"}
