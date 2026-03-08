# Matriz de Aderencia ao Edital - Evolucao POC

## Requisitos Transversais

| Requisito | Implementacao | Evidencia |
|---|---|---|
| Controle de acesso por perfis | `accessControlService` com recursos por modulo | Testes de autorizacao por rota |
| Rastreabilidade e auditoria | `audit_logs`, `process_events`, trilha por processo | Endpoints de processo e eventos |
| Seguranca de sessao e token | JWT obrigatorio, `authMiddleware`, `x-request-id` e logging | Respostas 401/403 e logs estruturados |
| Integridade e persistencia | SQLite relacional com constraints e FKs | Inicializacao em `src/db/index.js` |
| Usabilidade operacional (API) | Swagger atualizado para modulos novos | `/api/docs` e `/api/openapi.json` |

## Requisitos Funcionais (Resumo)

| Modulo edital | Situacao na API | Endpoints principais |
|---|---|---|
| Planejamento/Inteligencia Fiscal | Parcial (nucleo analitico) | `/analytics/imports`, `/analytics/indicators`, `/analytics/dashboard` |
| Fiscalizacao Regime Geral/Simples | Parcial | `/fiscalizacao/cases`, `/analytics/priorities` |
| Regularizacao Orientada | Parcial | `/regularizacao/actions` |
| Processo Fiscal Eletronico | Parcial | `/processos`, `/processos/:processId/events`, `/comunicacoes` |
| AINF | Parcial | `/ainf` |
| DTE | Parcial | `/dte/messages`, `/dte/messages/:messageId/ack`, `/dte/inbox/:contributorId` |
| Portal do Contribuinte | Parcial | `/portal/requests`, `/portal/requests/:contributorId` |
| Modulos Especializados | Parcial (estrutura base) | `/especializados/:module/findings` |

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
