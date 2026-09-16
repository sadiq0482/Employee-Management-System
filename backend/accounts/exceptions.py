from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    Wraps DRF's default exception handler so every error response has a
    consistent, predictable JSON shape on the frontend:

        { "success": false, "message": "...", "errors": {...} }

    Full implementation (mapping validation errors, permission errors,
    404s, etc. into this shape) is completed in PHASE 19 — Validation &
    Error Handling. For now this simply delegates to DRF's default so the
    project runs correctly after initial setup.
    """
    response = exception_handler(exc, context)
    return response
