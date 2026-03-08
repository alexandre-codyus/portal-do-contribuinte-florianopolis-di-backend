# Matriz de Aderencia ao Edital - Evolucao POC

## Requisitos Transversais

| Requisito | Implementacao | Evidencia |
|---|---|---|
| Controle de acesso por perfis | `accessControlService` com recursos por modulo | Testes de autorizacao por rota |
| Rastreabilidade e auditoria | `audit_logs`, `process_events`, trilha por processo com `requestId` | Escritas no `platformController` com `writeAudit` |
| Seguranca de sessao e token | JWT obrigatorio, `authMiddleware`, `x-request-id`, rate limit em escrita | Respostas 401/403/429 e logs estruturados |
| Integridade e persistencia | SQLite relacional com constraints e FKs | Inicializacao em `src/db/index.js` |
| Usabilidade operacional (API) | Swagger com exemplos e erros de transicao | `/api/docs` e `/api/openapi.json` |

## Requisitos Funcionais (Resumo)

| Modulo edital | Situacao na API | Endpoints principais |
|---|---|---|
| Planejamento/Inteligencia Fiscal | Parcial (nucleo analitico) | `/analytics/imports`, `/analytics/indicators`, `/analytics/dashboard` |
| Fiscalizacao Regime Geral/Simples | Parcial avancado | `/fiscalizacao/cases`, `/fiscalizacao/cases/:caseId/status`, `/analytics/priorities` |
| Regularizacao Orientada | Parcial avancado | `/regularizacao/actions`, `/regularizacao/actions/:actionId/status` |
| Processo Fiscal Eletronico | Parcial avancado | `/processos`, `/processos/:processId/status`, `/processos/:processId/events`, `/comunicacoes`, `/comunicacoes/:processId` |
| AINF | Parcial avancado | `/ainf`, `/ainf/:ainfId/status` |
| DTE | Parcial | `/dte/messages`, `/dte/messages/:messageId/ack`, `/dte/inbox/:contributorId` |
| Portal do Contribuinte | Parcial | `/portal/requests`, `/portal/requests/:contributorId` |
| Modulos Especializados | Parcial (estrutura base) | `/especializados/:module/findings` |

## Detalhamento por módulo funcional

- [REQ_FUNC_INDICE_GERAL.md](REQ_FUNC_INDICE_GERAL.md)
- [REQ_FUNC_PLANEJAMENTO_INTELIGENCIA.md](REQ_FUNC_PLANEJAMENTO_INTELIGENCIA.md)
- [REQ_FUNC_FISCALIZACAO_REGULARIZACAO.md](REQ_FUNC_FISCALIZACAO_REGULARIZACAO.md)
- [REQ_FUNC_PROCESSO_E_COMUNICACAO.md](REQ_FUNC_PROCESSO_E_COMUNICACAO.md)
- [REQ_FUNC_AINF.md](REQ_FUNC_AINF.md)
- [REQ_FUNC_DTE.md](REQ_FUNC_DTE.md)
- [REQ_FUNC_PORTAL_CONTRIBUINTE.md](REQ_FUNC_PORTAL_CONTRIBUINTE.md)
- [REQ_FUNC_MODULOS_ESPECIALIZADOS.md](REQ_FUNC_MODULOS_ESPECIALIZADOS.md)

## Modulos Especializados Cobertos por Estrutura

- `desif`
- `auditoria-if`
- `construcao-civil`
- `nfse-repertorio`
- `servicos-tomados`
- `documentos-fiscais`
- `rdb-cadastro-municipal`

## Proximos passos de consolidacao

1. Implementar regras de negocio por modulo especializado com importadores reais.
2. Incluir dashboards dedicados por modulo e indicadores de efetividade.
3. Expandir suite de testes para cobranca de cenarios de borda e carga.
4. Evoluir transicoes de status para incluir aprovacao/homologacao por perfil.
