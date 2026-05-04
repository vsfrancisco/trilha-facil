# TrilhaFácil

<p align="center">
  <strong>Descubra sua próxima carreira no mercado digital.</strong>
</p>

<p align="center">
  Aplicação full stack com <strong>Next.js</strong> no frontend e <strong>FastAPI</strong> no backend, com foco em confiabilidade, validação de ambiente, observabilidade e operação segura.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Database-PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/ORM-SQLModel-111827?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLModel">
  <img src="https://img.shields.io/badge/Deploy-Render-2D2D2D?style=for-the-badge&logo=render&logoColor=white" alt="Render">
  <img src="https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions">
</p>

---

## Visão geral

O **TrilhaFácil** ajuda usuários a identificar uma trilha de carreira recomendada com base em informações do perfil, interesses e objetivos. O sistema também possui uma área administrativa com dashboard para consulta, filtros, paginação e gestão dos assessments enviados.[web:2601][web:2604]

Além das funcionalidades de produto, o projeto evoluiu para uma base mais robusta de engenharia, com validação de ambiente no frontend e backend, smoke tests, CI/CD e documentação operacional para deploy e rollback.[web:2410][web:1925][web:2211]

---

## Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- FastAPI
- SQLModel
- SQLAlchemy
- Pydantic Settings

### Infraestrutura
- PostgreSQL
- Render
- GitHub Actions

Essa combinação é bastante aderente a aplicações web modernas, com tipagem forte no frontend, validação declarativa no backend e boa integração para deploy contínuo.[web:2604][web:2607]

---

## Funcionalidades

- Formulário principal para gerar recomendação de trilha.
- Resultado com trilha sugerida, match percentual, justificativa e plano inicial.
- Dashboard administrativo com listagem paginada de assessments.
- Busca, filtros por trilha e intervalo de datas.
- Ordenação por múltiplos campos.
- Exclusão de registros com autenticação administrativa.
- Login/logout da área administrativa.
- Health checks e readiness checks para operação em produção.[web:2601]

---

## Estrutura do projeto

```txt
trilha-facil/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
├── backend/
│   ├── main.py
│   ├── settings.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── database.py
│   └── requirements.txt
├── docs/
│   └── rollback-checklist.md
└── .github/
    └── workflows/
```

---

## Ambientes e configuração

O projeto usa validação explícita de variáveis de ambiente no backend e no frontend. Isso significa que builds e deploys falham cedo quando uma variável obrigatória está ausente ou inválida, reduzindo erro silencioso em produção.[web:2410][web:1925]

### Backend
No backend, a configuração foi centralizada com **Pydantic Settings**, incluindo validação de ambiente, URL de banco, token administrativo, `SECRET_KEY` e lista de origens CORS.[web:2410]

Exemplo de `.env` do backend:

```env
APP_NAME=Trilha Fácil
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
SECRET_KEY=uma-chave-forte-com-mais-de-16-caracteres
ADMIN_TOKEN=um-token-forte
ENVIRONMENT=production
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000,https://trilha-facil-frontend.onrender.com
```

### Frontend
No frontend, a env pública principal é validada antes do build:

```env
NEXT_PUBLIC_API_BASE_URL=https://trilha-facil-backend.onrender.com
```

Como variáveis `NEXT_PUBLIC_*` são embutidas no build do Next.js, elas também precisam existir no ambiente do CI para o `build` passar corretamente.[web:1925]

---

## Como rodar localmente

### 1. Clone o repositório

```bash
git clone <url-do-repo>
cd trilha-facil
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend disponível em:

```txt
http://127.0.0.1:8000
```

Documentação automática:

```txt
http://127.0.0.1:8000/docs
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponível em:

```txt
http://localhost:3000
```

---

## Endpoints importantes

| Endpoint | Método | Descrição |
|---|---|---|
| `/` | `GET` | Verifica se a API está online |
| `/health` | `GET` | Health check da aplicação |
| `/ready` | `GET` | Readiness check com verificação do banco |
| `/assessments` | `GET` | Lista assessments com paginação e filtros |
| `/assessments` | `POST` | Cria novo assessment |
| `/assessments/{id}` | `GET` | Consulta assessment por ID |
| `/assessments/{id}` | `DELETE` | Remove assessment com autenticação |

Health checks são especialmente úteis em plataformas como Render, que usam esse sinal para validar instâncias antes de expor tráfego de produção.[web:2601]

---

## Dashboard administrativo

A área administrativa permite consultar e gerenciar os assessments recebidos pelo sistema. O dashboard foi ajustado para depender de uma env validada (`NEXT_PUBLIC_API_BASE_URL`), evitando erro silencioso de integração com backend em build e runtime.[web:1925]

Recursos principais:
- login administrativo;
- tabela paginada;
- busca textual;
- filtros;
- ordenação;
- remoção de registros;
- feedback visual com toasts.

---

## Qualidade e operação

O projeto passou por duas sprints focadas em confiabilidade operacional.

### Sprint 8 — Base de operação
- CI do frontend;
- CI do backend;
- smoke tests automatizados;
- template de Pull Request;
- rollback checklist.[web:2211]

### Sprint 9 — Hardening
- Pydantic Settings no backend;
- validação de env no frontend;
- correções de lint e typecheck;
- build falhando cedo quando env obrigatória está ausente;
- ajustes para reduzir configuração frágil entre local, CI e produção.[web:2410][web:1925][web:2593]

---

## Scripts úteis

### Frontend

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

### Backend

```bash
pytest
```

### Smoke test

```bash
BASE_URL=https://trilha-facil-backend.onrender.com ./smoke-test.sh
```

Separar lint, typecheck e build no CI ajuda a detectar erros mais cedo e torna o pipeline mais previsível.[web:2393][web:2604]

---

## Deploy

O deploy da aplicação é feito no **Render**, com frontend e backend publicados separadamente. O backend expõe health checks, e o frontend depende de `NEXT_PUBLIC_API_BASE_URL` corretamente definido tanto no ambiente de produção quanto no CI.[web:1925]

Itens importantes de deploy:
- configurar envs em cada serviço;
- manter CORS consistente com a URL pública do frontend;
- validar `/health` e `/ready` após release;
- usar o checklist de rollback em caso de regressão.

---

## Segurança e hardening

Alguns pontos já incorporados ao projeto:
- validação de env obrigatória;
- CORS configurado por ambiente;
- autenticação administrativa por token;
- cookies HTTP-only no fluxo administrativo;
- falha explícita em caso de configuração incompleta;
- redução de `any` e melhoria de tipagem no frontend.[web:2410][web:1925][web:2607]

Próximos endurecimentos naturais:
- rotação periódica de segredos;
- revisão final de logs e debug residual;
- checklist recorrente de segurança antes de releases maiores.[web:2585][web:2596]

---

## Documentação operacional

Arquivos já adicionados ao projeto:
- `docs/rollback-checklist.md`
- `PULL_REQUEST_TEMPLATE.md`
- workflows em `.github/workflows/`

Esses artefatos ajudam a padronizar deploy, revisão e recuperação em caso de incidente.[web:2599][web:2394]

---

## Status atual

O projeto está em um ponto mais maduro do que um protótipo inicial: além da funcionalidade principal, já possui base de validação, integração contínua e preparação operacional para produção. Isso reduz retrabalho e dá mais segurança para evoluir novas features sem quebrar o que já existe.[web:2584][web:2587]

---

## Observação

Se este README for usado no repositório principal, vale complementar depois com:
- screenshots da home e do dashboard;
- link público do frontend;
- link da documentação da API;
- GIF curto do fluxo principal.