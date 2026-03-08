# Roteiro de Demonstracao da Evolucao

## Preparacao

1. Configurar variaveis em `.env.local`:
   - `PORT=3333`
   - `JWT_SECRET=...`
2. Subir API:
   - `npm run dev`
3. Abrir Swagger:
   - `http://localhost:3333/api/docs`

## Fluxo sugerido de prova de conceito interna

1. **Autenticacao**
   - `POST /api/auth/login`
   - validar retorno do token e perfil.

2. **Contribuintes**
   - `GET /api/contributors`
   - `POST /api/contributors`
   - `PUT /api/contributors/{id}`
   - `DELETE /api/contributors/{id}`

3. **Inteligencia e priorizacao**
   - `POST /api/analytics/imports`
   - `GET /api/analytics/indicators`
   - `GET /api/analytics/dashboard`
   - `GET /api/analytics/priorities`

4. **Fiscalizacao e regularizacao**
   - `POST /api/fiscalizacao/cases`
   - `PATCH /api/fiscalizacao/cases/{caseId}/status`
   - `POST /api/regularizacao/actions`
   - `GET /api/regularizacao/actions`
   - `PATCH /api/regularizacao/actions/{actionId}/status`

5. **Processo fiscal e comunicacoes**
   - `POST /api/processos`
   - `PATCH /api/processos/{processId}/status`
   - `POST /api/processos/{processId}/events`
   - `POST /api/comunicacoes`
   - `GET /api/comunicacoes/{processId}`

6. **AINF**
   - `POST /api/ainf`
   - `PATCH /api/ainf/{ainfId}/status`
   - `GET /api/ainf`

7. **DTE + Portal**
   - `POST /api/dte/messages`
   - `POST /api/dte/messages/{messageId}/ack`
   - `POST /api/portal/requests`
   - `GET /api/portal/requests/{contributorId}`

8. **Especializados**
   - `POST /api/especializados/desif/findings`
   - `POST /api/especializados/nfse-repertorio/findings`
   - `GET /api/especializados/desif/findings`

## Evidencias para aceite

- Swagger atualizado com os grupos de endpoints.
- Logs estruturados com `x-request-id`.
- Auditoria de escrita com correlacao por `requestId` no backend.
- Persistencia em SQLite com dados auditaveis.
- Testes automatizados executando fluxos criticos e cenarios negativos de transicao.
