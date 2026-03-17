from fastapi import APIRouter, Depends
from schemas.add_report_article_schema import AddReportArticleSchema
from services.report_article_service import ReportArticleService
from bson import ObjectId
from core.dependencies import get_current_user

router = APIRouter()

@router.post("/add")
async def add_report_article(req: AddReportArticleSchema, payload: dict = Depends(get_current_user)):
    if not req.description.strip():
        return {"confirmation": "please fill description"}

    try:
        ObjectId(req.article_id)
    except:
        return {"confirmation": "invalid article_id"}

    report_id = await ReportArticleService.add_report(req.article_id, req.description)
    if not report_id:
        return {"confirmation": "backend error"}

    return {"confirmation": "successful: article reported"}
