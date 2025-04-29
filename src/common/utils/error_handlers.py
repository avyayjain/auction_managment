from starlette.requests import Request
from starlette.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from src.common.utils.generate_logs import logging
from src.common.utils.user_defined_errors import DataBaseErrors, FileErrors

logger = logging.getLogger(__name__)


def database_error_handler(_: Request, exc: DataBaseErrors) -> JSONResponse:
    return JSONResponse(content={'details': exc.message}, status_code=exc.response_code)


def file_error_handler(request: Request, exc: FileErrors) -> JSONResponse:
    logging.info(f"File not found: {request.path_params['filename']}")
    return JSONResponse(content={'details': exc.message}, status_code=exc.response_code)


def validation_error_handler(_, exc: RequestValidationError):
    reformatted_message = {}
    for pydantic_error in exc.errors():
        loc, msg = pydantic_error["loc"], pydantic_error["msg"]
        filtered_loc = loc[1:] if loc[0] in ("body", "query", "path") else loc
        field_string = ".".join(filtered_loc)
        reformatted_message[field_string] = []
        reformatted_message[field_string].append(msg)

    return JSONResponse(
        status_code=400,
        content={"detail": "Invalid request", "errors": reformatted_message},
    )


async def global_exception_handler(request: Request, call_next):
    try:

        return await call_next(request)

    except Exception:

        logger.error('', exc_info=True)

        return JSONResponse(content={'details': 'Internal Server Error.'}, status_code=500)
