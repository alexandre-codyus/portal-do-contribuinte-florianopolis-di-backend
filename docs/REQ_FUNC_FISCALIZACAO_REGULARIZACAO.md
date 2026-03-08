# Requisitos Funcionais - Fiscalização e Regularização

## Escopo do módulo

Gestão de casos de fiscalização e ações de regularização orientada com ciclo de status.

## Requisitos do edital cobertos

| Requisito (trecho) | Status | Evidência técnica |
|---|---|---|
| Abertura e priorização de fiscalizações | Parcial | `POST /api/fiscalizacao/cases`, `GET /api/analytics/priorities` |
| Controle de ciclo de vida do caso | Parcial | `PATCH /api/fiscalizacao/cases/:caseId/status`, transições em `platformService` |
| Registro de regularização orientada | Parcial | `POST /api/regularizacao/actions`, `GET /api/regularizacao/actions` |
| Evolução do status da regularização | Parcial | `PATCH /api/regularizacao/actions/:actionId/status` |

## Critérios de aceite objetivos

- Caso é criado com contribuinte válido.
- Mudança de status inválida retorna `409`.
- Ação de regularização permite evolução de status prevista.

## Lacunas para aderência plena

- Falta regra detalhada por tributo/regime para priorização.
- Falta workflow de aprovação/homologação por papel.

## Plano de fechamento (curto prazo)

1. Parametrizar regras de priorização por município.
2. Adicionar trilha de aprovação por perfil.
3. Integrar KPIs de resultado da regularização.
