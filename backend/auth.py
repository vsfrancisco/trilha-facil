import os
from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

admin_token_header = APIKeyHeader(name="X-Admin-Token", auto_error=False)

def verify_admin_token(api_key: str = Security(admin_token_header)):
    expected_token = os.getenv("ADMIN_API_TOKEN")

    if not expected_token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ADMIN_API_TOKEN não configurado no servidor"
        )

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token administrativo ausente"
        )

    if api_key != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token administrativo inválido"
        )

    return api_key