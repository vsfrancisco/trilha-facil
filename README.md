# TrilhaFácil 🚀

Um MVP focado em clareza de carreira. Ajuda profissionais em transição ou iniciantes a descobrirem uma trilha viável, entenderem suas lacunas de habilidades e executarem um plano prático de 30 dias.

## 🎯 O Problema
Pessoas querendo migrar para a economia digital (tecnologia, dados, planejamento) sofrem com excesso de informação. Elas não sabem qual área escolher, o que estudar primeiro e quais vagas fazem sentido para o momento atual.

## 💡 A Solução (Core Loop)
1. **Diagnóstico:** Questionário rápido (background, interesses, tempo, renda-alvo).
2. **Recomendação:** Motor sugere 1 a 3 trilhas ideais.
3. **Gap & Plano:** Mostra o que falta aprender e gera um roteiro de 30 dias.
4. **Ação:** Lista cursos curtos e vagas aderentes ao perfil.

## 🛠 Stack Tecnológica
- **Frontend:** Next.js (React), Tailwind CSS, TypeScript/JS.
- **Backend:** Python 3, FastAPI, SQLModel (Pydantic + SQLAlchemy).
- **Banco de Dados:** PostgreSQL.
- **Deploy:** Vercel (Front) + Render (Back/DB).

## 📅 Roadmap de Desenvolvimento (Sprints)

### Sprint 1: Validação & Diagnóstico (🎯 Foco Atual)
- [ ] Setup do repositório (Monorepo ou Multirepo).
- [ ] Modelagem de Dados inicial (Usuário e Assessment).
- [ ] API (FastAPI): Endpoint para receber respostas e retornar trilha estática/mockada.
- [ ] Frontend (Next.js): Landing page de captura.
- [ ] Frontend (Next.js): Formulário de diagnóstico (Wizard/Step-by-step).

### Sprint 2: Valor Prático (Trilhas e Gaps)
- [ ] API: Lógica real de pontuação (Match Score) entre perfil e trilha.
- [ ] Frontend: Página de Resultados (A trilha recomendada).
- [ ] Frontend: Exibição do Plano de 30 dias estático.
- [ ] Integração de Vagas e Cursos (Scraping básico ou curadoria manual no DB).

### Sprint 3: Retenção & Auth
- [ ] Integração de Autenticação (Clerk ou JWT próprio).
- [ ] Salvar resultados no banco (PostgreSQL).
- [ ] Dashboard do usuário (Acompanhamento do progresso).

## 🗄️ Modelo de Dados Inicial (PostgreSQL)
- `users`: id, email, created_at
- `assessments`: id, user_id, answers_json, created_at
- `career_tracks`: id, title, description, base_salary, required_skills (Array/JSON)