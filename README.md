# API - Inteligencia Fiscal POC

API REST em Node.js/Express para autenticacao, autorizacao por perfil e gestao de contribuintes.

## Documentacao deste projeto

- Visao tecnologica: `docs/TECNOLOGIA.md`
- Visao funcional: `docs/FUNCIONALIDADES.md`
- Referencias: `docs/REFERENCIAS.md`
- Matriz de aderencia ao edital: `docs/MATRIZ_ADERENCIA_EDITAL.md`
- Roteiro de demonstracao: `docs/ROTEIRO_DEMONSTRACAO.md`

## Como executar

1. Instale dependencias:

```bash
npm install
```

2. Configure ambiente:

- Ja existe `\.env.local` criado a partir de `\.env.example`.
- Se preferir, tambem pode usar `\.env`.

3. Rode em desenvolvimento:

```bash
npm run dev
```

4. API disponivel em:

- `http://localhost:3333/api`
- `http://localhost:3333/api/docs` (Swagger UI)
- `http://localhost:3333/api/openapi.json` (especificacao OpenAPI)

5. Testes automatizados:

```bash
npm test
```

## Endpoints principais

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/contributors`
- `GET /api/contributors/:id`
- `POST /api/contributors`
- `PUT /api/contributors/:id`
- `DELETE /api/contributors/:id`
- `POST /api/analytics/imports`
- `GET /api/analytics/indicators`
- `GET /api/analytics/dashboard`
- `GET /api/analytics/priorities`
- `POST /api/fiscalizacao/cases`
- `POST /api/regularizacao/actions`
- `GET /api/regularizacao/actions`
- `POST /api/processos`
- `GET /api/processos`
- `POST /api/processos/:processId/events`
- `POST /api/comunicacoes`
- `POST /api/ainf`
- `GET /api/ainf`
- `POST /api/dte/messages`
- `POST /api/dte/messages/:messageId/ack`
- `GET /api/dte/inbox/:contributorId`
- `POST /api/portal/requests`
- `GET /api/portal/requests/:contributorId`
- `POST /api/especializados/:module/findings`
- `GET /api/especializados/:module/findings`

## Perfis para login

- `admin / admin123`
- `gestor / gestor123`
- `auditor / auditor123`
- `leitor / leitor123`
