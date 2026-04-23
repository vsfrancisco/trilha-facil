import json
import logging
import time
import uuid
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, SQLModel, select

from auth import verify_admin_token
from database import engine
from models import Assessment
from schemas import AssessmentCreate, AssessmentRead
from settings import settings


logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(message)s",
)
logger = logging.getLogger("app")

app = FastAPI(title=settings.app_name)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
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
    db_ok = False

    try:
        with Session(engine) as session:
            session.exec(text("SELECT 1"))
        db_ok = True
    except SQLAlchemyError:
        db_ok = False
    except Exception:
        db_ok = False

    status_text = "ok" if db_ok else "degraded"
    status_code = 200 if db_ok else 503

    return JSONResponse(
        status_code=status_code,
        content={
            "status": status_text,
            "app": settings.app_name,
            "environment": settings.environment,
            "database": "connected" if db_ok else "disconnected",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


@app.get("/ready")
def ready():
    try:
        with Session(engine) as session:
            session.exec(text("SELECT 1"))

        return {
            "status": "ready",
            "app": settings.app_name,
            "environment": settings.environment,
        }
    except Exception:
        return JSONResponse(
            status_code=503,
            content={
                "status": "not_ready",
                "app": settings.app_name,
                "environment": settings.environment,
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


@app.get("/assessments", response_model=list[AssessmentRead])
def list_assessments(session: Session = Depends(get_session)):
    items = session.exec(select(Assessment).order_by(Assessment.id.desc())).all()
    return items


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