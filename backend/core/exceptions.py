from fastapi import HTTPException

class NotFound(HTTPException):
    def __init__(self, msg="Data not found"):
        super().__init__(status_code=404, detail=msg)

class BadRequest(HTTPException):
    def __init__(self, msg="Bad request"):
        super().__init__(status_code=400, detail=msg)

class Unauthorized(HTTPException):
    def __init__(self, msg="Unauthorized"):
        super().__init__(status_code=401, detail=msg)