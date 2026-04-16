from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
import random

from database import create_db_and_tables, get_session
from models import Assessment
from schemas import AssessmentIn, AssessmentRead

app = FastAPI(title="TrilhaFácil API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CAREER_TRACKS = {
    "dados": {
        "title": "Analista de Dados Júnior",
        "keywords": ["dados", "planilhas", "analise", "análise", "excel", "matemática", "números", "tecnologia", "lógica", "python", "sql", "powerbi"],
        "base_reason": "Seus interesses e background mostram forte inclinação para áreas analíticas, métricas e raciocínio lógico.",
        "plan_30_days": [
            "Semana 1: Dominar funções avançadas no Excel (PROCV, Tabela Dinâmica).",
            "Semana 2: Fazer um curso introdutório e gratuito de SQL.",
            "Semana 3: Criar seu primeiro dashboard simples no Power BI ou Looker Studio.",
            "Semana 4: Atualizar LinkedIn focando em análise e buscar vagas júnior."
        ],
        "example_roles": ["Assistente de BI", "Analista de Inteligência de Mercado Jr.", "Analista de Dados"]
    },
    "cs": {
        "title": "Analista de Sucesso do Cliente (CS)",
        "keywords": ["pessoas", "comunicação", "ajudar", "suporte", "clientes", "atendimento", "conversar", "relacionamento", "empatia", "resolver"],
        "base_reason": "Seu perfil focado em comunicação e resolução de problemas é ideal para a área de retenção e relacionamento com clientes.",
        "plan_30_days": [
            "Semana 1: Estudar Customer Success e diferença para suporte tradicional.",
            "Semana 2: Entender NPS, churn e LTV.",
            "Semana 3: Fazer curso introdutório de CS.",
            "Semana 4: Ajustar currículo e mapear startups para candidatura."
        ],
        "example_roles": ["Customer Success Analyst Jr.", "Analista de Implantação", "Analista de Experiência do Cliente"]
    },
    "marketing": {
        "title": "Analista de Marketing Digital / Growth",
        "keywords": ["criatividade", "redes", "sociais", "textos", "internet", "design", "campanhas", "marketing", "escrever", "conteúdo", "tráfego"],
        "base_reason": "Seus interesses indicam perfil criativo e comunicativo, muito aderente ao marketing digital.",
        "plan_30_days": [
            "Semana 1: Entender funil de marketing e aquisição.",
            "Semana 2: Escolher foco em conteúdo ou tráfego pago.",
            "Semana 3: Tirar certificação básica de analytics ou mídia.",
            "Semana 4: Criar mini portfólio e aplicar para vagas."
        ],
        "example_roles": ["Analista de Marketing Jr.", "Assistente de Tráfego Pago", "Social Media"]
    },
    "produto": {
        "title": "Analista de Produto / Product Owner Jr.",
        "keywords": ["organizar", "projetos", "liderança", "processos", "produto", "ágil", "scrum", "gestão", "planejar", "equipe"],
        "base_reason": "Você demonstra afinidade com organização, processos e visão de produto.",
        "plan_30_days": [
            "Semana 1: Aprender Scrum e Kanban.",
            "Semana 2: Estudar user stories e critérios de aceite.",
            "Semana 3: Entender ciclo de vida de produto digital.",
            "Semana 4: Buscar vagas de analista de produto júnior ou requisitos."
        ],
        "example_roles": ["Analista de Produto Jr.", "Product Owner Jr.", "Analista de Requisitos"]
    },
    "vendas_tech": {
        "title": "SDR / BDR (Pré-vendas Tech)",
        "keywords": ["vendas", "dinheiro", "comercial", "negociação", "metas", "resultados", "prospecção", "telefone"],
        "base_reason": "Seu foco em resultado, comunicação e metas indica boa aderência à área comercial em tecnologia.",
        "plan_30_days": [
            "Semana 1: Entender SDR, BDR e funil comercial.",
            "Semana 2: Estudar SPIN Selling e qualificação de leads.",
            "Semana 3: Praticar abordagem comercial e scripts.",
            "Semana 4: Ajustar LinkedIn para inside sales e aplicar para vagas."
        ],
        "example_roles": ["SDR", "BDR", "Inside Sales"]
    }
}

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {"message": "API do TrilhaFácil rodando com PostgreSQL 🚀"}

@app.post("/api/assessment")
def process_assessment(data: AssessmentIn, session: Session = Depends(get_session)):
    scores = {key: 0 for key in CAREER_TRACKS.keys()}

    user_interests = [i.lower() for i in data.interests]
    for interest in user_interests:
        for track_key, track_data in CAREER_TRACKS.items():
            if any(kw in interest for kw in track_data["keywords"]):
                scores[track_key] += 30

    current = data.current_field.lower()

    if any(word in current for word in ["venda", "comercial", "negócios", "representante"]):
        scores["vendas_tech"] += 15
    if any(word in current for word in ["atendimento", "suporte", "recepção", "telemarketing", "adm"]):
        scores["cs"] += 15
    if any(word in current for word in ["exatas", "ti", "eng", "finan", "contáb", "logística"]):
        scores["dados"] += 15
    if any(word in current for word in ["comunica", "arte", "jornal", "design", "publicidade", "eventos"]):
        scores["marketing"] += 15
    if any(word in current for word in ["projetos", "gestão", "coordena", "gerente", "rh"]):
        scores["produto"] += 15

    best_track_key = max(scores, key=scores.get)

    if scores[best_track_key] == 0:
        best_track_key = "cs"
        match_score = 68
    else:
        match_score = min(98, 70 + (scores[best_track_key] // 2) + random.randint(0, 4))

    best_track = CAREER_TRACKS[best_track_key]

    reason = (
        best_track["base_reason"]
        + f" Além disso, o mercado atual absorve bem talentos júniores com pretensão inicial de R$ {data.target_salary:,.2f}."
    )

    plan_30_days = " | ".join(best_track["plan_30_days"])
    example_roles = ", ".join(best_track["example_roles"])
    interests_str = ", ".join(data.interests)

    assessment = Assessment(
        age=data.age,
        education=data.education,
        current_field=data.current_field,
        target_salary=data.target_salary,
        interests=interests_str,
        recommended_track=best_track["title"],
        match_score=match_score,
        reason=reason,
        plan_30_days=plan_30_days,
        example_roles=example_roles,
    )

    session.add(assessment)
    session.commit()
    session.refresh(assessment)

    return {
        "status": "success",
        "id": assessment.id,
        "recommended_track": best_track["title"],
        "match_score": match_score,
        "reason": reason,
        "plan_30_days": best_track["plan_30_days"],
        "example_roles": best_track["example_roles"]
    }

@app.get("/api/assessments", response_model=list[AssessmentRead])
def list_assessments(
    session: Session = Depends(get_session),
    offset: int = 0,
    limit: int = Query(default=10, le=100)
):
    statement = (
        select(Assessment)
        .order_by(Assessment.id.desc())
        .offset(offset)
        .limit(limit)
    )
    assessments = session.exec(statement).all()
    return assessments

@app.get("/api/assessments/{assessment_id}", response_model=AssessmentRead)
def get_assessment(assessment_id: int, session: Session = Depends(get_session)):
    assessment = session.get(Assessment, assessment_id)

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment não encontrado")

    return assessment

@app.delete("/api/assessments/{assessment_id}")
def delete_assessment(assessment_id: int, session: Session = Depends(get_session)):
    assessment = session.get(Assessment, assessment_id)

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment não encontrado")

    session.delete(assessment)
    session.commit()

    return {"ok": True, "message": "Assessment excluído com sucesso"}