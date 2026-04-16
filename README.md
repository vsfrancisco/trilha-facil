# TrilhaFácil 🚀

Um MVP focado em clareza de carreira. Ajuda profissionais em transição ou iniciantes a descobrirem uma trilha viável no mercado digital, entenderem suas lacunas de habilidades e executarem um plano prático de 30 dias.

## 🎯 O Problema
Pessoas querendo migrar para a economia digital (tecnologia, dados, planejamento, marketing) sofrem com excesso de informação. Elas não sabem qual área escolher, o que estudar primeiro e quais vagas fazem sentido para o momento atual.

## 💡 A Solução (Core Loop Atual)
1. **Diagnóstico:** O usuário preenche um formulário rápido com sua idade, escolaridade, área atual, pretensão salarial e interesses.
2. **Motor de Decisão (Backend):** A API analisa as palavras-chave dos interesses e o background do usuário para calcular um *Match Score* entre 5 trilhas mapeadas (Dados, CS, Marketing, Produto e Vendas Tech).
3. **Plano Tático (Frontend):** O usuário recebe a trilha recomendada com uma justificativa personalizada, um roadmap dividido em 4 semanas (Plano de 30 dias) e exemplos de vagas para buscar no LinkedIn.

## 🛠 Stack Tecnológica
- **Frontend:** Next.js (React), Tailwind CSS, TypeScript.
- **Backend:** Python 3, FastAPI, Pydantic.
- **Banco de Dados (Próxima Fase):** PostgreSQL via SQLModel.
- **Deploy (Planejado):** Vercel (Front) + Render (Back/DB).

## 📅 Roadmap de Desenvolvimento (Sprints)

### ✅ Sprint 1 & 2: Validação, Diagnóstico e Motor de Recomendação
- [x] Setup do monorepo (FastAPI + Next.js).
- [x] Modelagem de Dados de Entrada (`AssessmentIn` via Pydantic).
- [x] API: Endpoint `POST /api/assessment` recebendo dados do frontend.
- [x] API: Lógica real de pontuação (*Match Score*) baseada em interesses e área atual.
- [x] API: Dicionário interno de profissões expandido com Planos de 30 Dias e Vagas Exemplo.
- [x] Frontend: Landing page com formulário de diagnóstico.
- [x] Frontend: Tratamento de erros, loading states e liberação de CORS.
- [x] Frontend: Interface de Resultados componentizada (Justificativa, Badges de Vagas, Lista de Tarefas).

### 🚧 Sprint 3: Infraestrutura e Persistência (Próximo Passo)
- [ ] Configuração do banco de dados relacional (PostgreSQL).
- [ ] Implementação do SQLModel no FastAPI (Tabelas `User` e `Assessment`).
- [ ] Salvar os resultados gerados no banco para análise de métricas de uso.
- [ ] Deploy do Backend no Render e do Frontend na Vercel.

### 🔮 Sprint 4: Retenção e Auth
- [ ] Integração de Autenticação (Clerk ou JWT próprio).
- [ ] Dashboard do usuário (Acompanhamento do progresso das 4 semanas).
- [ ] Curadoria dinâmica de cursos gratuitos por trilha.

## 🚀 Como rodar o projeto localmente

O projeto está dividido em duas partes: o backend (FastAPI) e o frontend (Next.js). É necessário rodar ambos simultaneamente.

### 1. Rodando o Backend
Abra um terminal na raiz do projeto e execute:
```bash
cd backend
# Ative o ambiente virtual (Windows)
.\venv\Scripts\activate
# Inicie o servidor
uvicorn main:app --reload
```
A API estará disponível em `http://127.0.0.1:8000`. Você pode ver a documentação interativa (Swagger) acessando `http://127.0.0.1:8000/docs`.

### 2. Rodando o Frontend
Abra um **novo terminal** na raiz do projeto e execute:
```bash
cd frontend
# Inicie o servidor de desenvolvimento
npm run dev
```
Acesse a aplicação no navegador em `http://localhost:3000`.