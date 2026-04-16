# TrilhaFácil

Plataforma web para diagnóstico inicial de carreira, recomendação de trilhas profissionais e visualização administrativa dos assessments realizados.

**MVP completo com backend protegido e dashboard administrativo.**

O projeto foi construído como full stack com frontend em Next.js e backend em FastAPI, persistindo dados em PostgreSQL no Neon.

[![Backend](https://img.shields.io/badge/Backend-FastAPI-blue)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js-orange)](https://nextjs.org)
[![Database](https://img.shields.io/badge/DB-PostgreSQL-brightgreen)](https://www.postgresql.org)

---

## Funcionalidades implementadas ✅

### Usuário final
- Formulário de assessment de carreira
- Processamento da recomendação no backend
- Retorno com:
  - trilha recomendada
  - score de match
  - justificativa
  - plano de 30 dias
  - cargos exemplo

### Backend / API **PROTEGIDA**
- ✅ Integração com PostgreSQL no Neon
- ✅ **Autenticação por header `X-Admin-Token`**
- ✅ Endpoint público: `POST /api/assessment`
- ✅ Endpoints protegidos:
  - `GET /api/assessments` - listar
  - `GET /api/assessments/{id}` - detalhe
  - `DELETE /api/assessments/{id}` - excluir

### Dashboard administrativo
- ✅ Listagem dos assessments
- ✅ Filtro por trilha
- ✅ KPIs do dashboard
- ✅ Gráfico de barras com Recharts
- ✅ Página de detalhe por assessment
- ✅ Exclusão de assessment
- ✅ Autenticação por cookie com expiração

---

## Stack utilizada

| Frontend | Backend | Database |
|----------|---------|----------|
| Next.js 14 | FastAPI | PostgreSQL |
| React 18 | SQLModel | Neon.tech |
| Tailwind CSS | Uvicorn | |
| Recharts | Pydantic | |
| TypeScript | Python 3.12 | |

---

## Estrutura do projeto
trilha-facil/
├── backend/
│ ├── .env # DATABASE_URL + ADMIN_API_TOKEN
│ ├── auth.py # ✅ Proteção X-Admin-Token
│ ├── database.py
│ ├── main.py # ✅ Endpoints protegidos
│ ├── models.py
│ ├── schemas.py
│ ├── requirements.txt
│ └── venv/
│
├── frontend/
│ ├── .env.local # NEXT_PUBLIC_ADMIN_API_TOKEN
│ ├── proxy.ts # Proteção dashboard
│ ├── package.json
│ └── src/
│ ├── app/
│ │ ├── api/
│ │ │ ├── login/
│ │ │ └── logout/
│ │ ├── dashboard/
│ │ │ └── [id]/
│ │ └── page.tsx
│ └── components/
│ ├── Toast.tsx
│ └── TrackBarChart.tsx

---

## Como rodar localmente

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

**Crie `backend/.env`:**
```env
DATABASE_URL=postgresql://SEU_USER:SUA_SENHA@SEU_HOST/SEU_DB?sslmode=require
ADMIN_API_TOKEN=seu-token-admin-super-seguro
```

```bash
python -m uvicorn main:app --reload
```

**API em**: `http://localhost:8000` | **Swagger**: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend
npm install
```

**Crie `frontend/.env.local`:**
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=123456
NEXT_PUBLIC_ADMIN_API_TOKEN=seu-token-admin-super-seguro
```

```bash
npm run dev
```

**App em**: `http://localhost:3000`

---

## Endpoints da API

### Público (usuário final)
POST /api/assessment

### Protegidos (header `X-Admin-Token`)
GET /api/assessments # Listar (limit/offset)
GET /api/assessments/{id} # Detalhe
DELETE /api/assessments/{id} # Excluir

**Exemplo com curl**:
```bash
curl -X GET "http://localhost:8000/api/assessments" \
  -H "X-Admin-Token: seu-token-admin-super-seguro"
```

---

## Autenticação

### Dashboard (cookie)
- Login simples via `/api/login`
- Proteção via `proxy.ts`
- Cookie HTTP-only com expiração
- Logout em `/api/logout`

### Backend (header)
- Header `X-Admin-Token`
- Validado por dependência `verify_admin_token`
- Token em variável de ambiente

---

## Fluxo completo
Usuário gera assessment → POST /api/assessment (público)

Admin faz login → dashboard protegido por cookie

Dashboard lista → GET /api/assessments (com X-Admin-Token)

Admin clica detalhe → GET /api/assessments/{id} (token)

Admin exclui → DELETE /api/assessments/{id} (token)

---

## Deploy

### Backend (Render)
DATABASE_URL → Render PostgreSQL
ADMIN_API_TOKEN → Render Environment


### Frontend (Render/Next.js)
NEXT_PUBLIC_ADMIN_API_TOKEN → Environment
Proxy backend → Render URL

text

---

## Status do projeto ✅
✅ Backend FastAPI + PostgreSQL (Neon)
✅ Frontend Next.js + Tailwind + Recharts
✅ Autenticação dashboard (cookie + proxy)
✅ Backend protegido (header X-Admin-Token)
✅ Dashboard com KPIs + gráfico + CRUD
✅ MVP funcional completo

text

---

## Próximos passos

- [ ] Modal para confirmação de exclusão
- [ ] Toast global reutilizável
- [ ] Filtro por período no dashboard
- [ ] Exportação CSV/PDF
- [ ] Deploy integrado no Render
- [ ] Responsividade mobile completa

---

## Autor

**Victor Francisco** 

---

*Projeto desenvolvido durante fase de MVP.*