# TrilhaFácil API

Backend da **TrilhaFácil** construído com **FastAPI + SQLModel**, com configuração centralizada por variáveis de ambiente, autenticação administrativa por token e endpoints de health/readiness para deploy mais previsível.[1][2]

A estrutura proposta concentra `settings`, banco, autenticação e CORS em uma única organização de projeto, o que reduz configuração espalhada e facilita manutenção local e em produção.[3][4]

## Stack

- **FastAPI** para a API HTTP.[5]
- **SQLModel/SQLAlchemy** para modelagem e acesso ao banco relacional.[6][7]
- **Pydantic Settings** para carregar e validar variáveis de ambiente.[1][8]
- **Uvicorn** para execução da aplicação ASGI em desenvolvimento e produção.[5]

## Estrutura sugerida

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

## Recursos principais

- Configuração centralizada via `settings.py`.[1][3]
- Validação de variáveis obrigatórias ainda na inicialização.[8]
- CORS configurado a partir de `CORS_ORIGINS`.[4]
- Endpoint de saúde (`/health`) para monitoramento e health checks no deploy.[2][9]
- Endpoint de prontidão (`/ready`) para readiness operacional.[2]
- Base pronta para SQLite em dev e PostgreSQL em produção.[7][10]

## Como instalar

### 1. Clone o repositório

```bash
git clone <url-do-repo>
cd <nome-do-repo>
```

### 2. Crie e ative o ambiente virtual

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

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

## Configuração

Crie o arquivo `.env` com base no exemplo abaixo. O FastAPI suporta leitura de variáveis de ambiente com uma camada dedicada de settings, e a estratégia com `pydantic-settings` facilita defaults, tipagem e validação.[1][11]

```env
ENVIRONMENT=development
LOG_LEVEL=INFO
DATABASE_URL=sqlite:///./trilhafacil.db
ADMIN_TOKEN=troque-este-token
CORS_ORIGINS=http://localhost:3000
```

### Variáveis

| Variável | Obrigatória | Descrição |
|---|---|---|
| `ENVIRONMENT` | Sim | Ambiente da aplicação: `development`, `staging`, `production` ou `test`.[1] |
| `LOG_LEVEL` | Sim | Nível de log, como `INFO` ou `DEBUG`.[3] |
| `DATABASE_URL` | Sim | URL de conexão do banco; pode ser SQLite local ou PostgreSQL em produção.[7][10] |
| `ADMIN_TOKEN` | Sim | Token usado para acesso a rotas administrativas.[1] |
| `CORS_ORIGINS` | Sim | Lista de origens permitidas, separadas por vírgula.[4] |

## Como rodar localmente

```bash
uvicorn main:app --reload
```

Depois disso, a aplicação normalmente ficará disponível nestes endereços:

- App: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Endpoints úteis

| Endpoint | Método | Finalidade |
|---|---|---|
| `/` | `GET` | Resposta simples para confirmar que a API subiu. |
| `/health` | `GET` | Verifica saúde geral e conexão com o banco para health checks.[2] |
| `/ready` | `GET` | Indica se a aplicação está pronta para receber tráfego.[2] |
| `/docs` | `GET` | Interface Swagger gerada pelo FastAPI.[5] |

## Exemplo de produção

Exemplo de `.env` usando PostgreSQL:

```env
ENVIRONMENT=production
LOG_LEVEL=INFO
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
ADMIN_TOKEN=token-super-seguro
CORS_ORIGINS=https://seu-frontend.onrender.com
```

Se o projeto for usar PostgreSQL no deploy, o ambiente precisa ter o driver correspondente instalado junto com as dependências da aplicação.[10][12]

## Deploy no Render

O Render oferece suporte a health checks configuráveis, o que combina bem com uma rota dedicada como `/health`.[2]

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

## `requirements.txt` recomendado

Para um ambiente com PostgreSQL em produção:

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

## Exemplo de `.env.example`

```env
ENVIRONMENT=development
LOG_LEVEL=INFO
DATABASE_URL=sqlite:///./trilhafacil.db
ADMIN_TOKEN=troque-este-token
CORS_ORIGINS=http://localhost:3000
```

## Fluxo de desenvolvimento

1. Ajustar `.env` local.
2. Rodar `uvicorn main:app --reload`.
3. Validar `/docs`, `/health` e `/ready`.
4. Testar integração com o frontend local.
5. Publicar com variáveis de produção configuradas no provedor de deploy.[2][9]

## Boas práticas já cobertas

- Configuração centralizada em vez de `os.getenv()` espalhado.[3]
- Separação entre settings, autenticação e banco.[1][13]
- CORS explícito para reduzir problemas entre frontend e backend.[4][14]
- Health checks para detectar falhas de instância ou banco no deploy.[2][9]

## Próximos passos recomendados

- Adicionar `.gitignore` apropriado para Python e `.env` local.
- Criar testes de smoke para `/health`, `/ready` e fluxo principal.
- Documentar o frontend esperado em `CORS_ORIGINS` para evitar erro entre ambientes.[15][4]