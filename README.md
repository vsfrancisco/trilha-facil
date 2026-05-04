# TrilhaFácil API

<p align="center">
  Backend da <strong>TrilhaFácil</strong> construído com <strong>FastAPI + SQLModel</strong>, com autenticação administrativa, configuração centralizada, health checks, CI com GitHub Actions e deploy pronto para o Render.
</p>

<p align="center">
  <a href="https://fastapi.tiangolo.com/">
    <img src="https://img.shields.io/badge/FastAPI-109989?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  </a>
  <a href="https://www.python.org/">
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  </a>
  <a href="https://sqlmodel.tiangolo.com/">
    <img src="https://img.shields.io/badge/SQLModel-111827?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLModel">
  </a>
  <a href="https://render.com/">
    <img src="https://img.shields.io/badge/Render-2D2D2D?style=for-the-badge&logo=render&logoColor=white" alt="Render">
  </a>
  <a href="https://github.com/features/actions">
    <img src="https://img.shields.io/badge/GitHub_Actions-CI-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions">
  </a>
</p>

---

## ✨ Visão geral

A **TrilhaFácil API** foi organizada para facilitar desenvolvimento local, deploy previsível e manutenção em produção. A arquitetura centraliza configurações, autenticação, banco, CORS e monitoramento em uma base simples e prática.[web:874][web:2398]

Hoje o projeto já conta com:
- autenticação administrativa por token;
- integração com frontend publicado;
- endpoints de health/readiness;
- CI no GitHub Actions;
- smoke tests automatizados;
- checklist de rollback para incidentes.[web:874][web:2233]

---

## 📚 Índice

- [Tecnologias](#-tecnologias)
- [Recursos](#-recursos)
- [Estrutura](#-estrutura)
- [Configuração](#-configuração)
- [Como rodar localmente](#-como-rodar-localmente)
- [Endpoints principais](#-endpoints-principais)
- [Deploy no Render](#-deploy-no-render)
- [CI/CD e qualidade](#-cicd-e-qualidade)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Próximos passos](#-próximos-passos)

---

## 🚀 Tecnologias

- **FastAPI** — framework principal da API.[web:2233]
- **SQLModel / SQLAlchemy** — modelagem e persistência relacional.
- **Pydantic Settings** — configuração via ambiente com tipagem e validação.
- **Uvicorn** — execução da aplicação ASGI.
- **SQLite / PostgreSQL** — banco local e banco de produção.
- **GitHub Actions** — CI para frontend e backend.
- **Render** — deploy com health checks e rollback.[web:874][web:2243]

---

## 🧩 Recursos

- Configuração centralizada em `settings.py`.
- Validação de variáveis obrigatórias no startup.
- CORS configurável para ambientes local e produção.[web:874]
- Endpoint `/health` para monitoramento.
- Endpoint `/ready` para readiness.
- Autenticação administrativa por token.
- Smoke tests básicos para validar ambiente publicado.
- Template de Pull Request para padronizar revisões.
- Checklist de rollback para incidentes em produção.[web:874][web:2233]

---

## 🗂 Estrutura

```txt
.
├── .github/
│   └── workflows/
│       ├── frontend-ci.yml
│       └── backend-ci.yml
├── docs/
│   └── rollback-checklist.md
├── tests/
│   └── test_health.py
├── auth.py
├── database.py
├── main.py
├── models.py
├── schemas.py
├── settings.py
├── requirements.txt
├── smoke-test.sh
├── .env
└── .env.example
```

---

## ⚙️ Configuração

Crie um arquivo `.env` com base no exemplo abaixo:

```env
ENVIRONMENT=development
LOG_LEVEL=INFO
DATABASE_URL=sqlite:///./trilhafacil.db
ADMIN_TOKEN=troque-este-token
CORS_ORIGINS=http://localhost:3000
```

A configuração por ambiente ajuda a manter desenvolvimento e produção previsíveis, especialmente em deploys automatizados.[web:874][web:2259]

---

## 💻 Como rodar localmente

### 1. Clonar o repositório

```bash
git clone <url-do-repo>
cd <nome-do-repo>
```

### 2. Criar ambiente virtual

#### Linux/macOS

```bash
python -m venv .venv
source .venv/bin/activate
```

#### Windows PowerShell

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. Instalar dependências

```bash
pip install -r requirements.txt
```

### 4. Rodar a aplicação

```bash
uvicorn main:app --reload
```

Depois disso:

- App: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

## 🔎 Endpoints principais

| Endpoint | Método | Descrição |
|---|---|---|
| `/` | `GET` | Confirma que a API está online |
| `/health` | `GET` | Health check da aplicação |
| `/ready` | `GET` | Readiness para deploy e monitoramento |
| `/docs` | `GET` | Swagger UI |
| `/redoc` | `GET` | Documentação alternativa |

Health checks são importantes em plataformas como Render porque ajudam a validar a instância antes de receber tráfego de produção.[web:874][web:2243]

---

## ☁️ Deploy no Render

### Build Command

```bash
pip install -r requirements.txt
```

### Start Command

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Health Check Path

```txt
/health
```

O Render suporta deploy contínuo integrado ao GitHub e usa health checks para decidir quando uma nova versão está pronta para receber tráfego.[web:874][web:2259]

---

## ✅ CI/CD e qualidade

O projeto já possui base para qualidade e operação:

### GitHub Actions
- `frontend-ci.yml` para lint, typecheck e build do frontend.
- `backend-ci.yml` para instalar dependências e rodar testes do backend.[web:2245]

### Smoke tests
O script `smoke-test.sh` valida endpoints principais do ambiente publicado, ajudando a detectar falhas grosseiras após deploy.[web:2233]

### Pull Request template
Padroniza descrição, testes, risco e rollback da mudança.

### Rollback checklist
Documento operacional para reversão rápida de releases com problema, especialmente útil em produção com Render.[web:874]

---

## 🔐 Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `ENVIRONMENT` | Sim | Ambiente da aplicação |
| `LOG_LEVEL` | Sim | Nível de logs |
| `DATABASE_URL` | Sim | URL do banco |
| `ADMIN_TOKEN` | Sim | Token de autenticação administrativa |
| `CORS_ORIGINS` | Sim | Lista de origens permitidas |

### Exemplo para produção

```env
ENVIRONMENT=production
LOG_LEVEL=INFO
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
ADMIN_TOKEN=token-super-seguro
CORS_ORIGINS=https://trilha-facil-frontend.onrender.com
```

---

## 🧪 Testes

### Rodar testes do backend

```bash
PYTHONPATH=. pytest
```

### Rodar smoke test

```bash
BASE_URL=https://trilha-facil-backend.onrender.com ./smoke-test.sh
```

---

## 📌 Boas práticas cobertas

- Configuração centralizada.
- CORS explícito por ambiente.
- Health checks para deploy.
- CI automatizado com GitHub Actions.
- Teste automatizado básico no backend.
- Smoke test para ambiente publicado.
- Checklist de rollback para incidentes.[web:874][web:2233]

---

## 🛣 Próximos passos

- Expandir cobertura de testes do backend.
- Adicionar testes para rotas de negócio.
- Refinar observabilidade e logs.
- Evoluir smoke tests para fluxo funcional mais completo.
- Revisar warnings de depreciação do FastAPI e Pydantic no código atual.

---