from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from database import engine
from models import Assessment
from schemas import AssessmentCreate, AssessmentRead
from auth import verify_admin_token

app = FastAPI(title="TrilhaFácil API")

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
    
@app.get("/health")
def health():
    return {"ok": True}