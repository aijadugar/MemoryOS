from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from utils.exceptions import AppError


def error_response(status_code: int, message: str, error: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "error": error,
        },
    )


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
        return error_response(status_code=exc.status_code, message=exc.message, error=exc.error)

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        if isinstance(exc.detail, dict):
            message = str(exc.detail.get("message", "Request failed"))
            error = str(exc.detail.get("error", exc.detail.get("detail", "http_error")))
        else:
            message = str(exc.detail)
            error = "http_error"

        return error_response(status_code=exc.status_code, message=message, error=error)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
        return error_response(status_code=422, message="Validation error", error=str(exc.errors()))

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
        return error_response(status_code=500, message="Internal server error", error=exc.__class__.__name__)
