# Trilha Fácil







Plataforma full-stack para gerar **assessments de carreira** e recomendar **trilhas profissionais**, com painel administrativo para consulta, análise e gestão dos diagnósticos em produção.[1][2]

## Visão geral

O projeto é composto por dois serviços principais: um frontend em Next.js com App Router e um backend em FastAPI, conectados a um banco PostgreSQL hospedado no Neon e publicados no Render.[1][2]

A aplicação pública coleta dados do usuário, processa o assessment e apresenta uma recomendação de trilha. A área administrativa oferece autenticação por sessão, dashboard, filtros, exportação e ações de gestão sobre os assessments salvos.[3][4]

## Demonstração

### Fluxo principal
- Usuário preenche o formulário de assessment.
- O frontend envia os dados ao backend FastAPI.
- O backend processa a resposta, persiste no PostgreSQL e devolve a recomendação.
- A área admin autentica o operador e consome rotas protegidas via proxy server-side no Next.js.[2][3][1]

### Área administrativa
- Login com sessão via cookie `httpOnly`.[3]
- Dashboard com listagem dos assessments.[1]
- Filtro por trilha e período.[1]
- Visualização detalhada de cada diagnóstico.[1]
- Exclusão com confirmação.[1]
- Exportação CSV e impressão em PDF.[1]

## Arquitetura

```text
Usuário
  |
  v
Frontend (Next.js)
  |- páginas públicas
  |- login admin
  |- route handlers /api/admin/*
  |
  v
Backend (FastAPI)
  |- endpoints públicos
  |- endpoints administrativos protegidos por token
  |
  v
PostgreSQL (Neon)
```

O frontend usa Route Handlers como camada intermediária para chamadas administrativas. Isso permite validar a sessão no servidor e enviar o `X-Admin-Token` ao backend sem expor o segredo no navegador.[1][3]

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy/SQLModel, Uvicorn |
| Banco | PostgreSQL |
| Infra | Render, Neon |

A separação entre frontend, backend e banco segue um padrão de deploy comum para aplicações SSR com APIs e variáveis de ambiente por serviço.[1][5]

## Estrutura do projeto

```bash
trilha-facil/
├─ backend/
│  ├─ main.py
│  ├─ database.py
│  ├─ models.py
│  ├─ schemas.py
│  ├─ crud.py
│  ├─ requirements.txt
│  └─ .env
├─ frontend/
│  ├─ src/
│  │  ├─ app/
│  │  ├─ components/
│  │  └─ lib/
│  ├─ package.json
│  └─ .env.local
└─ README.md
```

## Funcionalidades

### Público
- Preenchimento do assessment.
- Geração de recomendação de trilha.
- Justificativa do resultado.
- Plano inicial de 30 dias.
- Exemplos de cargos compatíveis.

### Administrativo
- Login com sessão.
- Dashboard com listagem.
- Filtro por trilha.
- Filtro por data.
- Página de detalhes.
- Exclusão de assessment.
- Exportação CSV.
- Exportação PDF via impressão.
- Feedback visual com toast global.

## Autenticação admin

O login administrativo é processado no frontend por uma rota server-side. Após credenciais válidas, o sistema grava um cookie de sessão `httpOnly`, `sameSite="lax"` e `secure` em produção, prática recomendada para autenticação baseada em sessão.[3]

As rotas administrativas do frontend operam como proxy. O browser acessa `/api/admin/...`, o Next.js valida a sessão e só então repassa a chamada ao FastAPI com o header `X-Admin-Token` no servidor.[1][3]

## Variáveis de ambiente

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://...
ADMIN_API_TOKEN=seu-token-admin
FRONTEND_URL=https://seu-frontend.onrender.com
```

### Frontend local (`frontend/.env.local`)

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua-senha-forte
AUTH_SECRET=uma-chave-forte
ADMIN_API_TOKEN=seu-token-admin
NEXT_PUBLIC_API_BASE_URL=https://seu-backend.onrender.com
```

### Regras importantes
- Variáveis com `NEXT_PUBLIC_` são expostas ao client e devem conter apenas valores públicos.[6][3]
- Segredos como `AUTH_SECRET`, `ADMIN_PASSWORD` e `ADMIN_API_TOKEN` devem permanecer no servidor.[3][4]
- No Render, variáveis precisam ser cadastradas no serviço correto e aplicadas por deploy para entrarem em vigor.[5][1]

## Executando localmente

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd trilha-facil
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
# ou .\venv\Scripts\activate no Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend local:

```txt
http://localhost:8000
```

### 3. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend local:

```txt
http://localhost:3000
```

## Deploy no Render

### Backend
- **Type**: Web Service
- **Root Directory**: `backend`
- **Build Command**:

```bash
pip install -r requirements.txt
```

- **Start Command**:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend
- **Type**: Web Service
- **Root Directory**: `frontend`
- **Build Command**:

```bash
npm install && npm run build
```

- **Start Command**:

```bash
npm run start
```

O Render oferece suporte a aplicações Next.js com SSR e API routes, mas exige configuração explícita de environment variables por serviço.[1][5]

## Banco de dados

O backend usa PostgreSQL. Se a engine estiver configurada com o dialeto `psycopg2`, a dependência deve ser compatível com esse driver, como `psycopg2-binary`, para evitar erro de import em produção.[2]

## Rotas principais

### Backend público
- `POST /api/assessment`
- `GET /health` ou `/`

### Backend admin
- `GET /api/assessments`
- `GET /api/assessments/{id}`
- `DELETE /api/assessments/{id}`

### Frontend admin
- `POST /api/login`
- `POST /api/logout`
- `GET /api/admin/assessments`
- `GET /api/admin/assessments/{id}`
- `DELETE /api/admin/assessments/{id}`

## Smoke test de produção

Após cada deploy, validar:

1. Abrir `/login`.
2. Fazer login.
3. Confirmar redirect para `/dashboard`.
4. Validar carregamento da lista.
5. Abrir um assessment.
6. Excluir um assessment.
7. Exportar CSV.
8. Exportar PDF.
9. Fazer logout.
10. Confirmar que `/dashboard` volta a exigir login.[1][5]

## Segurança

- Sessão administrativa em cookie `httpOnly`.[3]
- `sameSite="lax"` e `secure` em produção.[3]
- Token administrativo mantido apenas no servidor.[6][3]
- CORS restrito à origem do frontend no backend.[2]
- Segredos fora do código-fonte e centralizados em environment variables.[5][4]

## Melhorias futuras

- Paginação no dashboard.
- Busca textual por usuário, trilha ou área.
- Métricas agregadas por período.
- Observabilidade e logs estruturados.
- CI/CD com validação de build.
- Centralização de settings com Pydantic Settings no backend.[4][7]

## Status atual

Projeto publicado em produção com frontend no Render, backend FastAPI no Render, banco PostgreSQL no Neon, autenticação administrativa funcional e smoke tests aprovados.[1][5]

## Autor

**Victor Francisco**

Desenvolvedor full-stack focado em aplicações web, APIs e soluções orientadas a produto.