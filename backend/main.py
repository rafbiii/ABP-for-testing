import os
import logging
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from core.api_handlers import validation_exception_handler
from routes import auth, article, comment, rating, report_article, report_user, user
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Updated Backend Template")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

logger.info(f"Allowed Origins: {ALLOWED_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(RequestValidationError, validation_exception_handler)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(article.router, prefix="/article", tags=["Article"])
app.include_router(comment.router, prefix="/comment", tags=["Comment"])
app.include_router(rating.router, prefix="/rating", tags=["Rating"])
app.include_router(report_article.router, prefix="/report_article", tags=["Report Article"])
app.include_router(report_user.router, prefix="/report_user", tags=["Report User"])
app.include_router(user.router, prefix="/user", tags=["User"])

@app.get("/")
def root():
    return {"message": "API Ready"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)