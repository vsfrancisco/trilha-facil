from fastapi import Cookie, HTTPException, status
from settings import settings

ADMIN_TOKEN = settings.admin_token


def verify_admin_token(admin_token: str | None = Cookie(default=None)) -> str:
    if not admin_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não autenticado",
        )

    if admin_token != ADMIN_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token inválido",
        )

    return admin_token