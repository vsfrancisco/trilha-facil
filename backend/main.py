import json
import logging
import time
import uuid
from datetime import date, datetime, timezone
from enum import Enum
from math import ceil
from typing import Generic, TypeVar

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pydantic.generics import GenericModel
from sqlalchemy import asc, desc, func, or_, text
from sqlmodel import Session, SQLModel, select

from auth import verify_admin_token
from database import engine
from models import Assessment
from schemas import (
    AssessmentCreate,
    AssessmentRead,
    PaginatedResponse,
    SortField,
    SortOrder,
)
from settings import settings


logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(message)s",
)
logger = logging.getLogger("app")

app = FastAPI(title=settings.app_name)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start_time = time.perf_counter()

    try:
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logger.info(json.dumps({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": "INFO",
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
            "client": request.client.host if request.client else None,
        }))

        response.headers["X-Request-ID"] = request_id
        return response

    except Exception as exc:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logger.exception(json.dumps({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": "ERROR",
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "duration_ms": duration_ms,
            "error": str(exc),
        }))

        return JSONResponse(
            status_code=500,
            content={
                "detail": "Erro interno do servidor",
                "request_id": request_id,
            },
            headers={"X-Request-ID": request_id},
        )


def get_session():
    with Session(engine) as session:
        yield session


@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

    logger.info(json.dumps({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "level": "INFO",
        "message": "Application startup complete",
        "environment": settings.environment,
        "app_name": settings.app_name,
    }))


@app.get("/")
def root():
    return {
        "message": f"{settings.app_name} online",
        "environment": settings.environment,
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "app": settings.app_name,
        "environment": settings.environment,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/ready")
def ready():
    try:
        with Session(engine) as session:
            session.exec(text("SELECT 1"))

        return {
            "status": "ready",
            "app": settings.app_name,
            "environment": settings.environment,
            "database": "connected",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception:
        return JSONResponse(
            status_code=503,
            content={
                "status": "not_ready",
                "app": settings.app_name,
                "environment": settings.environment,
                "database": "disconnected",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )

@app.post("/assessments", response_model=AssessmentRead)
def create_assessment(
    payload: AssessmentCreate,
    session: Session = Depends(get_session),
):
    assessment = Assessment.model_validate(payload)
    session.add(assessment)
    session.commit()
    session.refresh(assessment)
    return assessment


@app.get("/assessments", response_model=PaginatedResponse[AssessmentRead])
def list_assessments(
    session: Session = Depends(get_session),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = Query(None),
    track: str | None = Query(None),
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    sort_by: SortField = Query(SortField.created_at),
    sort_order: SortOrder = Query(SortOrder.desc),
):
    stmt = select(Assessment)

    if search:
        pattern = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                Assessment.current_field.ilike(pattern),
                Assessment.interests.ilike(pattern),
                Assessment.recommended_track.ilike(pattern),
                Assessment.reason.ilike(pattern),
                Assessment.education.ilike(pattern),
            )
        )

    if track:
        stmt = stmt.where(Assessment.recommended_track.ilike(f"%{track.strip()}%"))

    if start_date:
        stmt = stmt.where(func.date(Assessment.created_at) >= start_date)

    if end_date:
        stmt = stmt.where(func.date(Assessment.created_at) <= end_date)

    total_stmt = select(func.count()).select_from(stmt.subquery())
    total = session.exec(total_stmt).one()

    sort_column = getattr(Assessment, sort_by.value)
    ordering = desc(sort_column) if sort_order == SortOrder.desc else asc(sort_column)

    offset = (page - 1) * page_size
    items = session.exec(
        stmt.order_by(ordering).offset(offset).limit(page_size)
    ).all()

    total_pages = ceil(total / page_size) if total > 0 else 1

    return PaginatedResponse[AssessmentRead](
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@app.get("/assessments/{assessment_id}", response_model=AssessmentRead)
def get_assessment(
    assessment_id: int,
    session: Session = Depends(get_session),
):
    assessment = session.get(Assessment, assessment_id)

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment não encontrado")

    return assessment


@app.delete("/assessments/{assessment_id}")
def delete_assessment(
    assessment_id: int,
    session: Session = Depends(get_session),
    _: str = Depends(verify_admin_token),
):
    assessment = session.get(Assessment, assessment_id)

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment não encontrado")

    session.delete(assessment)
    session.commit()

    return {"ok": True, "deleted_id": assessment_id}