# TrilhaFácil API

[![FastAPI](https://img.shields.io/badge/FastAPI-109989?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![SQLModel](https://img.shields.io/badge/SQLModel-111827?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlmodel.tiangolo.com/)
[![Render](https://img.shields.io/badge/Render-2D2D2D?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

Backend da **TrilhaFácil** construído com **FastAPI + SQLModel**, com configuração centralizada por variáveis de ambiente, autenticação administrativa por token, CORS explícito para o frontend e endpoints de health/readiness prontos para produção.[web:2223][web:2182][web:1638][web:874]

---

## Índice

- [Visão geral](#visão-geral)
- [Stack](#stack)
- [Recursos](#recursos)
- [Estrutura](#estrutura)
- [Ambiente](#ambiente)
- [Rodando localmente](#rodando-localmente)
- [Endpoints](#endpoints)
- [Produção](#produção)
- [Deploy no Render](#deploy-no-render)
- [requirements.txt](#requirementstxt)
- [Fluxo de desenvolvimento](#fluxo-de-desenvolvimento)
- [Boas práticas cobertas](#boas-práticas-cobertas)
- [Próximos passos](#próximos-passos)

---

## Visão geral

A API foi organizada para facilitar desenvolvimento local e deploy previsível no Render. A base concentra `settings`, banco, autenticação e CORS em uma estrutura simples, reduzindo configuração espalhada e evitando problemas clássicos de integração entre frontend e backend.[web:2223][web:2182][web:874]

---

## Stack

- **FastAPI** — API HTTP moderna com documentação automática.[web:2223]
- **SQLModel / SQLAlchemy** — modelagem e persistência relacional.[web:2231]
- **Pydantic Settings** — configuração tipada e validada por ambiente.[web:2223][web:2224]
- **Uvicorn** — servidor ASGI para desenvolvimento e produção.[web:2223]
- **PostgreSQL / SQLite** — banco local e banco de produção.[web:874][web:2231]

---

## Recursos

- Configuração centralizada em `settings.py`.[web:2223]
- Validação de variáveis obrigatórias na inicialização.[web:2223][web:2228]
- CORS configurado para o frontend do projeto.[web:2182][web:874]
- Endpoint `/health` para monitoramento e health checks.[web:1638][web:874]
- Endpoint `/ready` para readiness operacional.[web:1638]
- Autenticação administrativa por token em rotas sensíveis.[web:874]
- Base pronta para deploy no Render com variáveis segregadas por ambiente.[web:874][web:1638]

---

## Estrutura

```txt
.
├── auth.py
├── database.py
├── main.py
├── models.py
├── schemas.py
├── settings.py
├── requirements.txt
├── .env
└── .env.example
```

---

## Ambiente

Crie o arquivo `.env` com base no exemplo abaixo. O uso de `pydantic-settings` ajuda a manter as variáveis tipadas e previsíveis.[web:2223][web:2224]

```env
ENVIRONMENT=development
LOG_LEVEL=INFO
DATABASE_URL=sqlite:///./trilhafacil.db
ADMIN_TOKEN=troque-este-token
CORS_ORIGINS=http://localhost:3000
```

| Variável | Obrigatória | Função |
|---|---|---|
| `ENVIRONMENT` | Sim | Ambiente da aplicação: `development`, `staging`, `production` ou `test`.[web:2223] |
| `LOG_LEVEL` | Sim | Nível de logs da aplicação. |
| `DATABASE_URL` | Sim | URL do banco, SQLite no dev e PostgreSQL em produção.[web:2231][web:874] |
| `ADMIN_TOKEN` | Sim | Token de autenticação administrativa.[web:874] |
| `CORS_ORIGINS` | Sim | Origens permitidas para o frontend.[web:2182][web:874] |

---

## Rodando localmente

### Instalação

```bash
git clone <url-do-repo>
cd <nome-do-repo>
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Execução

```bash
uvicorn main:app --reload
```

Depois disso:

- App: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

## Endpoints

| Endpoint | Método | Finalidade |
|---|---|---|
| `/` | `GET` | Confirma que a API subiu. |
| `/health` | `GET` | Health check da aplicação e do banco.[web:1638][web:874] |
| `/ready` | `GET` | Indica prontidão para tráfego.[web:1638] |
| `/docs` | `GET` | Swagger UI automática do FastAPI.[web:2223] |

---

## Produção

Exemplo de `.env` para produção com PostgreSQL:

```env
ENVIRONMENT=production
LOG_LEVEL=INFO
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
ADMIN_TOKEN=token-super-seguro
CORS_ORIGINS=https://trilha-facil-frontend.onrender.com
```

No Render, health checks e variáveis de ambiente são parte central do deploy seguro, e o CORS deve listar a origem exata do frontend em produção.[web:874][web:1638][web:2182]

---

## Deploy no Render

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

Render documenta health checks como parte importante do deploy de serviços FastAPI.[web:1638][web:874]

---

## `requirements.txt`

```txt
fastapi
uvicorn[standard]
sqlmodel
sqlalchemy
pydantic
pydantic-settings
python-dotenv
psycopg[binary]
```

---

## Fluxo de desenvolvimento

1. Ajustar `.env` local.
2. Rodar `uvicorn main:app --reload`.
3. Validar `/docs`, `/health` e `/ready`.
4. Testar integração com o frontend.
5. Publicar com variáveis de produção configuradas no provedor de deploy.[web:1638][web:874][web:2182]

---

## Boas práticas cobertas

- Configuração centralizada com settings tipadas.[web:2223][web:2224]
- Separação clara entre banco, auth e configuração.[web:874]
- CORS explícito para integração com frontend.[web:2182][web:874]
- Health check pronto para monitoramento no Render.[web:1638][web:874]

---

## Próximos passos

- Adicionar `.gitignore` para Python e `.env`.
- Criar testes de smoke para `/health`, `/ready` e o fluxo principal.
- Documentar as origens esperadas em `CORS_ORIGINS` para evitar erro entre ambientes.[web:1638][web:2182]