# 🚀 TrilhaFácil

> Plataforma web para diagnóstico inicial de carreira, recomendação de trilhas profissionais e visualização administrativa dos assessments realizados.

<p align="left">
  <img src="https://img.shields.io/badge/status-MVP%20ativo-2563eb?style=for-the-badge" alt="Status MVP ativo" />
  <img src="https://img.shields.io/badge/sprint%203-conclu%C3%ADda-16a34a?style=for-the-badge" alt="Sprint 3 concluída" />
  <img src="https://img.shields.io/badge/frontend-Next.js-111827?style=for-the-badge&logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/backend-FastAPI-059669?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/database-PostgreSQL-0f766e?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/deploy%20db-Neon-0ea5e9?style=for-the-badge" alt="Neon" />
</p>

---

## ✨ Sobre o projeto

O **TrilhaFácil** é um MVP full stack que ajuda usuários a descobrirem possíveis trilhas de carreira com base em um assessment simples.

A aplicação coleta informações do perfil, envia os dados para a API e retorna:
- trilha recomendada;
- score de aderência;
- justificativa;
- plano inicial de 30 dias;
- exemplos de vagas relacionadas.

Além da experiência principal do usuário, o projeto inclui um **dashboard administrativo protegido**, com visualização de dados, filtros, gráfico, detalhe por assessment, exclusão de registros e melhorias de UX.

---

## 🧰 Stack utilizada

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
- Pydantic
- Python Dotenv

### Banco de dados
- PostgreSQL
- Neon.tech

---

## ✅ Funcionalidades

### Usuário final
- Formulário de assessment de carreira
- Envio dos dados para a API pública
- Resultado com trilha recomendada, score, justificativa, plano e vagas exemplo
- Exibição formatada na interface
- Tratamento visual de erro

### Dashboard administrativo
- Login administrativo
- Proteção de rota com `proxy.ts`
- Cookie HTTP-only para sessão
- Listagem de assessments
- Visualização detalhada por ID
- Exclusão de assessment
- KPIs do dashboard
- Resumo por trilha
- Gráfico de barras com Recharts
- Filtro por trilha
- Filtro por período
- Recalculo de KPIs e gráfico com base nos filtros
- Tabela com scroll horizontal no mobile

### UX / Polimento
- Modal de confirmação
- Toast global reutilizável
- Skeleton loading
- Melhor responsividade mobile
- Tipagem refinada em TypeScript
- Ajustes de compatibilidade frontend/backend

### Backend / Segurança
- Persistência no PostgreSQL
- Integração com Neon
- Endpoint público para criação
- Endpoints administrativos protegidos
- Header `X-Admin-Token`
- `pool_pre_ping=True`
- `pool_recycle=300`

---

## 🗺️ Roadmap

- [x] Sprint 0 — Base do MVP
- [x] Sprint 1 — Dashboard administrativo
- [x] Sprint 2 — Proteção do backend
- [x] Sprint 3 — Polimento UX
- [ ] Sprint 4 — Exportação e deploy
- [ ] Sprint 5 — Inteligência da recomendação

### Sprint 4 sugerida
- [ ] Exportação CSV
- [ ] Exportação PDF
- [ ] Deploy integrado frontend + backend
- [ ] Hardening da autenticação
- [ ] Melhorias visuais do painel

---

## 🖼️ Fluxo do produto

```text
Usuário preenche formulário
        ↓
Frontend envia POST /api/assessment
        ↓
Backend processa e salva no PostgreSQL
        ↓
Frontend exibe trilha recomendada
        ↓
Admin acessa /login
        ↓
Dashboard protegido consome endpoints administrativos
```

---

## 📁 Estrutura do projeto

```bash
trilha-facil/
├── backend/
│   ├── auth.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── proxy.ts
│   ├── package.json
│   ├── .env.local
│   └── src/
│       ├── app/
│       │   ├── api/
│       │   │   ├── login/route.ts
│       │   │   └── logout/route.ts
│       │   ├── dashboard/
│       │   │   ├── [id]/page.tsx
│       │   │   └── page.tsx
│       │   ├── login/page.tsx
│       │   ├── layout.tsx
│       │   └── page.tsx
│       └── components/
│           ├── ConfirmModal.tsx
│           ├── ToastContainer.tsx
│           └── TrackBarChart.tsx
│
└── README.md
```

---

## 🔌 Endpoints principais

### Público
```http
POST /api/assessment
```

### Administrativos
```http
GET /api/assessments
GET /api/assessments/{assessment_id}
DELETE /api/assessments/{assessment_id}
```

### Health check
```http
GET /
```

---

## 🔐 Segurança

O acesso administrativo usa duas camadas simples:

### Frontend
- Login com credenciais em variável de ambiente
- Sessão com cookie HTTP-only
- Proteção de rota com `proxy.ts`

### Backend
- Validação via header:
```http
X-Admin-Token: seu-token-admin-super-seguro
```

Isso separa:
- a experiência pública de assessment;
- a experiência administrativa de leitura e exclusão.

> Para produção, o ideal é evoluir para autenticação server-side mais robusta e eliminar exposição direta do token ao cliente.

---

## ⚙️ Como rodar localmente

### 1. Clone o projeto

```bash
git clone <URL_DO_REPOSITORIO>
cd trilha-facil
```

### 2. Rode o backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Crie o arquivo `.env` em `backend/`:

```env
DATABASE_URL=postgresql://SEU_USER:SUA_SENHA@SEU_HOST/SEU_DB?sslmode=require
ADMIN_API_TOKEN=seu-token-admin-super-seguro
```

Backend:
```txt
http://localhost:8000
```

Swagger:
```txt
http://localhost:8000/docs
```

### 3. Rode o frontend

```bash
cd frontend
npm install
npm install recharts
npm run dev
```

Crie o arquivo `.env.local` em `frontend/`:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=123456
NEXT_PUBLIC_ADMIN_API_TOKEN=seu-token-admin-super-seguro
```

Frontend:
```txt
http://localhost:3000
```

---

## 🧪 Fluxos principais

### Usuário final
1. Preenche o formulário
2. Envia dados para `POST /api/assessment`
3. Recebe recomendação de trilha
4. Visualiza plano e vagas exemplo

### Administrador
1. Faz login em `/login`
2. Entra no dashboard protegido
3. Filtra dados por trilha e período
4. Visualiza detalhes
5. Exclui registros quando necessário

---

<details>
  <summary><strong>📌 Observações técnicas</strong></summary>

- O projeto usa frontend em `http://localhost:3000` e backend em `http://localhost:8000`.
- O backend está com CORS liberado para ambiente local.
- O Neon pode encerrar conexões ociosas; por isso o engine usa `pool_pre_ping` e `pool_recycle`.
- O login atual é simples e adequado para MVP interno.
- O token administrativo também é simples e voltado ao estágio atual do projeto.
- `example_roles` e `plan_30_days` são tratados no frontend para compatibilidade com o formato atual retornado pela API.

</details>

<details>
  <summary><strong>📦 Modelo de dados</strong></summary>

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

</details>

---

## 📊 Status do projeto

| Sprint | Status |
|---|---|
| Sprint 0 — Base do MVP | ✅ Concluída |
| Sprint 1 — Dashboard administrativo | ✅ Concluída |
| Sprint 2 — Proteção do backend | ✅ Concluída |
| Sprint 3 — Polimento UX | ✅ Concluída |
| Sprint 4 — Exportação e deploy | ⏳ Próxima |

---

## 👨‍💻 Autor

Desenvolvido por **Victor Francisco**.

---