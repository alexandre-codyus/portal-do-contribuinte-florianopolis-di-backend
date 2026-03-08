# Requisitos Funcionais - Auto de Infração (AINF)

## Escopo do módulo

Lavratura e evolução de autos de infração relacionados ao Simples Nacional.

## Requisitos do edital cobertos

| Requisito (trecho) | Status | Evidência técnica |
|---|---|---|
| Lavratura de auto de infração com cálculo | Parcial | `POST /api/ainf`, cálculo `taxAmount + penaltyAmount` |
| Vinculação ao processo fiscal | Parcial | pré-condição de `processId` em `platformService.createAinf` |
| Controle de status do auto | Parcial | `PATCH /api/ainf/:ainfId/status` |
| Rastreabilidade do AINF no processo | Parcial | evento `STATUS_AINF_ATUALIZADO` em `process_events` |

## Critérios de aceite objetivos

- AINF sem `processId` válido retorna `400`.
- Atualização de status inválida retorna `409`.
- AINF criado retorna `totalAmount`.

## Lacunas para aderência plena

- Falta cálculo tributário completo por hipótese legal.
- Falta emissão documental oficial do auto com layout/legalidade completa.

## Plano de fechamento (curto prazo)

1. Expandir motor de cálculo por cenário fiscal.
2. Gerar artefato formal do auto.
3. Integrar revisão técnica antes de notificação.
