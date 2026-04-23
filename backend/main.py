from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timezone

from database import engine
from models import Assessment
from schemas import AssessmentCreate, AssessmentRead
from auth import verify_admin_token

import json
import logging
import time
import uuid

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("app")

app = FastAPI(title="TrilhaFácil API")

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    start_time = time.perf_counter()
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    client_ip = request.client.host if request.client else "unknown"

    request.state.request_id = request_id

    logger.info(json.dumps({
        "event": "request_started",
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "client_ip": client_ip,
    }))

    try:
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        response.headers["X-Request-ID"] = request_id

        logger.info(json.dumps({
            "event": "request_completed",
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
            "client_ip": client_ip,
        }))

        return response

    except Exception as e:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logger.exception(json.dumps({
            "event": "request_failed",
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "duration_ms": duration_ms,
            "client_ip": client_ip,
            "error_type": e.__class__.__name__,
            "error": str(e),
        }))

        raise

@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return JSONResponse(
            status_code=200,
            content={
                "status": "ok",
                "api": "up",
                "database": "up",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )

    except SQLAlchemyError as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "api": "up",
                "database": "down",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "detail": str(e.__class__.__name__),
            },
        )

    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "api": "up",
                "database": "down",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "detail": str(e.__class__.__name__),
            },
        )


def create_db_and_tables():
    Assessment.metadata.create_all(engine)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def read_root():
    return {"message": "API do TrilhaFácil está online"}


@app.post("/api/assessment", response_model=AssessmentRead)
def create_assessment(payload: AssessmentCreate):
    recommended_track = "Dados"
    match_score = 85
    reason = (
        f"Com base nos interesses informados ({payload.interests}) e na sua área atual "
        f"({payload.current_field}), a trilha de {recommended_track} apresentou boa aderência."
    )
    plan_30_days = (
        "Semana 1: revisar fundamentos | "
        "Semana 2: estudar ferramentas da trilha | "
        "Semana 3: criar projeto prático | "
        "Semana 4: atualizar currículo e aplicar para vagas"
    )
    example_roles = "Analista de Dados Júnior, BI Júnior, Assistente de Dados"

    assessment = Assessment(
        age=payload.age,
        education=payload.education,
        current_field=payload.current_field,
        target_salary=payload.target_salary,
        interests=payload.interests,
        recommended_track=recommended_track,
        match_score=match_score,
        reason=reason,
        plan_30_days=plan_30_days,
        example_roles=example_roles,
    )

    with Session(engine) as session:
        session.add(assessment)
        session.commit()
        session.refresh(assessment)
        return assessment


@app.get("/api/assessments", response_model=list[AssessmentRead])
def list_assessments(
    limit: int = 50,
    offset: int = 0,
    _: str = Depends(verify_admin_token)
):
    with Session(engine) as session:
        statement = (
            select(Assessment)
            .order_by(Assessment.id.desc())
            .offset(offset)
            .limit(limit)
        )
        results = session.exec(statement).all()
        return results


@app.get("/api/assessments/{assessment_id}", response_model=AssessmentRead)
def get_assessment(
    assessment_id: int,
    _: str = Depends(verify_admin_token)
):
    with Session(engine) as session:
        assessment = session.get(Assessment, assessment_id)

        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment não encontrado")

        return assessment


@app.delete("/api/assessments/{assessment_id}")
def delete_assessment(
    assessment_id: int,
    _: str = Depends(verify_admin_token)
):
    with Session(engine) as session:
        assessment = session.get(Assessment, assessment_id)

        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment não encontrado")

        session.delete(assessment)
        session.commit()

        return {"message": "Assessment excluído com sucesso"}
    
