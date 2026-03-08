# Requisitos Funcionais - Processo Fiscal Eletrônico e Comunicação

## Escopo do módulo

Formalização de processos fiscais eletrônicos, eventos de tramitação e comunicações vinculadas.

## Requisitos do edital cobertos

| Requisito (trecho) | Status | Evidência técnica |
|---|---|---|
| Criação e acompanhamento de processo fiscal eletrônico | Parcial | `POST /api/processos`, `GET /api/processos` |
| Gestão de etapas/eventos processuais | Parcial | `POST /api/processos/:processId/events`, `GET /api/processos/:processId/events` |
| Controle de status do processo | Parcial | `PATCH /api/processos/:processId/status` |
| Comunicação formal integrada ao processo | Parcial | `POST /api/comunicacoes`, `GET /api/comunicacoes/:processId` |

## Critérios de aceite objetivos

- Processo é criado com vínculo opcional ao caso.
- Eventos são gravados com ator e timestamp.
- Comunicação é listada por processo.

## Lacunas para aderência plena

- Falta gestão completa de prazos legais por etapa.
- Falta motor de workflow configurável por tipo processual.

## Plano de fechamento (curto prazo)

1. Definir catálogo de etapas e prazos por rito.
2. Implementar alertas automáticos por vencimento.
3. Criar visualização de linha do tempo com SLA.
