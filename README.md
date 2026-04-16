# TrilhaFácil

Plataforma web para diagnóstico inicial de carreira, recomendação de trilhas profissionais e visualização administrativa dos assessments realizados.

O projeto foi construído como um MVP full stack com frontend em Next.js e backend em FastAPI, persistindo dados em PostgreSQL no Neon.

---

## Visão geral

O TrilhaFácil recebe respostas de um assessment simples e retorna:
- trilha recomendada;
- score de aderência;
- justificativa;
- plano inicial de 30 dias;
- exemplos de vagas relacionadas.

Além da experiência principal do usuário, o projeto possui um dashboard administrativo protegido, com autenticação, gráfico, visualização detalhada, exclusão de registros e melhorias de experiência como modal de confirmação, toast global e skeleton loading.

---

## Stack utilizada

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts

### Backend
- FastAPI
- SQLModel
- Uvicorn
- PostgreSQL
- Pydantic
- Python Dotenv

### Banco de dados
- Neon.tech (PostgreSQL)

---

## Funcionalidades implementadas

### Usuário final
- Formulário de assessment de carreira
- Envio dos dados para o backend via API pública
- Retorno com:
  - trilha recomendada
  - score de match
  - justificativa
  - plano de 30 dias
  - cargos exemplo
- Exibição formatada do resultado na interface
- Tratamento visual de erro no formulário

### Backend / API
- Integração com PostgreSQL no Neon
- Persistência dos assessments no banco
- Endpoint público para criar assessment
- Endpoint protegido para listar assessments
- Endpoint protegido para buscar assessment por ID
- Endpoint protegido para excluir assessment
- Proteção administrativa com header `X-Admin-Token`
- Pool resiliente para Neon com:
  - `pool_pre_ping=True`
  - `pool_recycle=300`

### Dashboard administrativo
- Listagem dos assessments
- Filtro por trilha
- KPIs do dashboard
- Resumo por trilha
- Gráfico de barras com Recharts
- Página de detalhe por assessment
- Exclusão de assessment pelo detalhe
- Skeleton loading no dashboard
- Skeleton loading na tela de detalhe

### Autenticação
- Login simples para acesso ao dashboard
- Proteção de rota com `proxy.ts`
- Cookie HTTP-only para sessão
- Sessão com expiração por tempo
- Redirecionamento para login quando a sessão expira
- Logout

### Experiência do usuário
- Toast global reutilizável
- Modal de confirmação para exclusão
- Feedback visual de sucesso e erro
- Parsing frontend para campos retornados como string (`example_roles` e `plan_30_days`)
- Tipagem refinada em TypeScript para evitar incompatibilidades entre frontend e backend

---

## Estrutura do projeto

```bash
trilha-facil/
├── backend/
│   ├── .env
│   ├── auth.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   └── venv/
│
├── frontend/
│   ├── .env.local
│   ├── proxy.ts
│   ├── package.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts
│   │   │   │   └── logout/
│   │   │   │       └── route.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── components/
│   │       ├── ConfirmModal.tsx
│   │       ├── ToastContainer.tsx
│   │       └── TrackBarChart.tsx
│
├── .gitignore
└── README.md
```

---

## Endpoints principais da API

### Health check
```http
GET /
```

### Criar assessment (público)
```http
POST /api/assessment
```

### Listar assessments (protegido)
```http
GET /api/assessments
```

Parâmetros suportados:
- `limit`
- `offset`

Exemplo:
```http
GET /api/assessments?limit=10&offset=0
```

### Buscar assessment por ID (protegido)
```http
GET /api/assessments/{assessment_id}
```

### Excluir assessment (protegido)
```http
DELETE /api/assessments/{assessment_id}
```

---

## Segurança

O dashboard usa duas camadas simples de proteção:

### Frontend
- login com credenciais administrativas;
- sessão por cookie HTTP-only;
- bloqueio de rota com `proxy.ts`.

### Backend
- proteção dos endpoints administrativos via header:
```http
X-Admin-Token: seu-token-admin-super-seguro
```

Isso garante que:
- o usuário final consegue enviar o assessment normalmente;
- apenas a área administrativa pode listar, consultar e excluir registros.

> Observação: essa solução é adequada para MVP interno. Em produção, o ideal é evoluir para autenticação server-side real ou proxy seguro entre frontend e backend.

---

## Modelo de dados

Cada assessment salvo contém:
- idade
- escolaridade
- área atual
- pretensão salarial
- interesses
- trilha recomendada
- score de match
- justificativa
- plano de 30 dias
- cargos exemplo
- data de criação

---

## Como rodar localmente

## 1. Clonar o projeto

```bash
git clone <URL_DO_REPOSITORIO>
cd trilha-facil
```

---

## 2. Backend

Entre na pasta:

```bash
cd backend
```

Crie e ative o ambiente virtual.

### Windows
```bash
python -m venv venv
.\venv\Scripts\activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Crie o arquivo `.env` dentro de `backend/`.

Exemplo:

```env
DATABASE_URL=postgresql://SEU_USER:SUA_SENHA@SEU_HOST/SEU_DB?sslmode=require
ADMIN_API_TOKEN=seu-token-admin-super-seguro
```

Suba a API:

```bash
python -m uvicorn main:app --reload
```

A API deverá abrir em:

```txt
http://localhost:8000
```

Swagger:

```txt
http://localhost:8000/docs
```

---

## 3. Frontend

Em outro terminal, entre na pasta:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Se ainda não instalou o gráfico:

```bash
npm install recharts
```

Crie o arquivo `.env.local`:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=123456
NEXT_PUBLIC_ADMIN_API_TOKEN=seu-token-admin-super-seguro
```

Suba o frontend:

```bash
npm run dev
```

A aplicação deverá abrir em:

```txt
http://localhost:3000
```

---

## Fluxo da aplicação

### Usuário final
1. Preenche o formulário de assessment
2. O frontend envia os dados para `POST /api/assessment`
3. O backend processa e salva o assessment
4. O frontend exibe o resultado formatado

### Admin
1. Faz login em `/login`
2. A sessão é validada por cookie
3. A rota `/dashboard` é protegida por `proxy.ts`
4. O frontend envia `X-Admin-Token` nas chamadas administrativas
5. O backend valida o token e libera acesso aos dados

---

## Observações importantes

- No ambiente local, foi padronizado o uso de:
  - frontend: `http://localhost:3000`
  - backend: `http://localhost:8000`
- O backend usa CORS configurado para permitir o frontend local.
- O cookie de autenticação usa:
  - `httpOnly`
  - `sameSite=lax`
  - `secure` condicionado ao ambiente de produção
- O login atual é simples, com credenciais fixas em variável de ambiente.
- O token administrativo também é simples e voltado ao MVP.
- O banco Neon pode suspender conexões ociosas; por isso o projeto usa `pool_pre_ping` e `pool_recycle` no engine.

---

## Status atual

### Sprint 0 — Base do MVP
- concluída

### Sprint 1 — Dashboard administrativo
- concluída

### Sprint 2 — Proteção do backend
- concluída

### Sprint 3 — Polimento UX
- concluída parcialmente com:
  - modal de confirmação
  - toast global
  - skeleton loading
  - revisão de tipagem
  - alinhamento frontend/backend

---

## Próximos passos sugeridos

- Filtro por período no dashboard
- Responsividade mobile refinada
- Exportação CSV
- Exportação PDF
- Proteção mais robusta para produção
- Deploy integrado frontend + backend
- Melhorias visuais adicionais no painel
- Recomendação mais inteligente no backend (regras melhores ou ML)

---

## Autor

Projeto desenvolvido por Victor Francisco.