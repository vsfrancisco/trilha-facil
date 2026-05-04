# Rollback Checklist

## Objetivo

Este checklist define os passos para reverter uma release com problema e restaurar rapidamente uma versão estável do sistema.

---

## Quando executar rollback

Execute rollback se ocorrer qualquer um dos cenários abaixo:

- Falha de login ou acesso administrativo.
- Dashboard não carrega dados críticos.
- Backend responde com erro 5xx em rotas principais.
- Frontend quebra após deploy.
- Health check `/health` ou `/ready` falha.
- Regressão grave em produção confirmada.
- Erro de configuração de ambiente, segredo ou CORS.

---

## Responsável

Definir antes do deploy:

- Responsável técnico pelo deploy
- Responsável pela validação pós-deploy
- Canal de comunicação do incidente

---

## Pré-check rápido

Antes de iniciar rollback, confirmar:

- [ ] O problema foi reproduzido em produção
- [ ] O erro não é cache/local/browser específico
- [ ] Logs do frontend e backend foram consultados
- [ ] Health check foi testado
- [ ] O impacto é real para usuários ou operação

---

## Rollback no Render

### Backend

1. Acessar o painel do Render.
2. Abrir o serviço do backend.
3. Ir em **Events**.
4. Localizar o último deploy estável com sucesso.
5. Clicar em **Rollback**.
6. Confirmar em **Rollback to this deploy**.[web:2222]

### Frontend

1. Acessar o painel do Render.
2. Abrir o serviço do frontend.
3. Ir em **Events**.
4. Localizar o último deploy estável com sucesso.
5. Clicar em **Rollback**.
6. Confirmar em **Rollback to this deploy**.[web:2222]

---

## Verificações pós-rollback

Após concluir o rollback:

- [ ] Validar `GET /health`
- [ ] Validar `GET /ready`
- [ ] Validar carregamento da home
- [ ] Validar carregamento do dashboard
- [ ] Validar login/logout
- [ ] Validar fluxo principal de negócio
- [ ] Confirmar ausência de erro crítico no console e nos logs

Health checks são fundamentais nesse processo porque o Render usa esse sinal para interromper tráfego para instâncias problemáticas e pode cancelar deploys ruins automaticamente em alguns cenários.[web:1638]

---

## Variáveis de ambiente

Se o problema estiver relacionado a configuração:

- [ ] Revisar `CORS_ORIGINS`
- [ ] Revisar `BACKEND_URL`
- [ ] Revisar `NEXT_PUBLIC_API_BASE_URL`
- [ ] Revisar tokens administrativos
- [ ] Confirmar secrets no serviço correto
- [ ] Verificar se houve mudança recente de `.env` ou variables no painel

---

## Banco de dados

Antes de qualquer rollback com impacto em dados:

- [ ] Verificar se houve migração de schema
- [ ] Confirmar compatibilidade da versão anterior com o banco atual
- [ ] Confirmar se rollback de código é suficiente sem rollback de dados

Importante: no Render, discos mantêm estado entre deploys e não são revertidos automaticamente junto com o rollback da aplicação.[web:2222]

---

## Comunicação

Registrar no incidente:

- horário da falha;
- horário do rollback;
- versão afetada;
- causa provável;
- impacto percebido;
- resultado do rollback;
- ações preventivas.

Documentação operacional clara acelera recuperação e reduz tempo de indisponibilidade.[web:2384][web:2385]

---

## Critérios de encerramento

O incidente só pode ser encerrado quando:

- [ ] A versão estável estiver novamente ativa
- [ ] Os health checks estiverem normais
- [ ] O fluxo crítico estiver validado
- [ ] O time responsável estiver informado
- [ ] A causa raiz estiver registrada para correção futura

---

## Observações

- Em caso de dúvida, priorizar restauração rápida do serviço antes de investigar otimizações.
- Não insistir em corrigir produção “ao vivo” se a reversão for mais segura.
- Toda falha relevante deve gerar ajuste no CI, smoke test ou checklist para evitar recorrência.[web:2382][web:2391]