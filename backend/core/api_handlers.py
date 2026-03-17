from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    custom_errors = []

    for err in errors:
        custom_errors.append({
            "type": err.get("type"),
            "loc": err.get("loc"),
            "confirmation": err.get("msg"),
            "input": err.get("input"),
            "ctx": err.get("ctx"),
        })

    return JSONResponse(
        status_code=422,
        content=jsonable_encoder({
            "detail": custom_errors
        }),
    )
