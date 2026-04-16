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

Além da experiência principal do usuário, o projeto também possui um dashboard administrativo com autenticação simples, gráfico por trilha, visualização detalhada e exclusão de registros.

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
- Psycopg
- Python Dotenv

### Banco de dados
- Neon.tech (PostgreSQL)

---

## Funcionalidades já implementadas

### Usuário final
- Formulário de assessment de carreira
- Processamento da recomendação no backend
- Retorno com:
  - trilha recomendada
  - score de match
  - justificativa
  - plano de 30 dias
  - cargos exemplo

### Backend / API
- Integração com PostgreSQL no Neon
- Persistência dos assessments no banco
- Endpoint para criar assessment
- Endpoint para listar assessments
- Endpoint para buscar assessment por ID
- Endpoint para excluir assessment

### Dashboard administrativo
- Listagem dos assessments
- Filtro por trilha
- KPIs do dashboard
- Resumo por trilha
- Gráfico de barras com Recharts
- Página de detalhe por assessment
- Exclusão de assessment pelo detalhe

### Autenticação
- Login simples para acesso ao dashboard
- Proteção de rota com `proxy.ts`
- Cookie HTTP-only para sessão
- Sessão com expiração por tempo
- Redirecionamento para login quando a sessão expira
- Logout
- Feedback visual com toast

---

## Estrutura do projeto

```bash
trilha-facil/
├── backend/
│   ├── .env
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
│   │   │   └── page.tsx
│   │   └── components/
│   │       ├── Toast.tsx
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

### Criar assessment
```http
POST /api/assessment
```

### Listar assessments
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

### Buscar assessment por ID
```http
GET /api/assessments/{assessment_id}
```

### Excluir assessment
```http
DELETE /api/assessments/{assessment_id}
```

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
ADMIN_USERNAME=admin
ADMIN_PASSWORD=123456
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

## Fluxo de autenticação

O dashboard é protegido por cookie e `proxy.ts`.

### Funcionamento
- usuário sem sessão tenta acessar `/dashboard`;
- o `proxy.ts` redireciona para `/login`;
- ao fazer login, a aplicação grava o cookie `admin_auth`;
- com sessão válida, o acesso ao dashboard é liberado;
- ao expirar a sessão, o usuário é redirecionado novamente para o login;
- ao clicar em sair, o cookie é removido.

---

## Dashboard administrativo

O dashboard possui:
- cards com indicadores principais;
- gráfico de distribuição por trilha;
- filtro por trilha;
- resumo agregado;
- tabela com os assessments;
- acesso ao detalhe por clique;
- exclusão de registro.

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
- O login atual é simples, com credenciais fixas em variável de ambiente. É suficiente para o painel administrativo do MVP, mas não é o modelo final de autenticação para produção.

---

## Próximos passos sugeridos

- Proteger também os endpoints sensíveis do backend
- Trocar autenticação simples por usuário real no banco
- Hash de senha
- Modal visual no lugar de `window.confirm`
- Toast global reutilizável
- Filtro por período no dashboard
- Exportação CSV
- Deploy integrado frontend + backend
- Melhorias visuais e responsividade do painel

---

## Status do projeto

MVP em evolução com:
- assessment funcional;
- API persistindo no PostgreSQL;
- dashboard administrativo;
- gráfico;
- detalhamento;
- exclusão;
- autenticação simples com expiração de sessão.

---

## Autor

Projeto desenvolvido por Victor Francisco.