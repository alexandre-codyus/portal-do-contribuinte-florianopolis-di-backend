# Requisitos Funcionais - Portal do Contribuinte

## Escopo do módulo

Abertura e acompanhamento de solicitações eletrônicas do contribuinte.

## Requisitos do edital cobertos

| Requisito (trecho) | Status | Evidência técnica |
|---|---|---|
| Abertura eletrônica de requerimentos | Parcial | `POST /api/portal/requests` |
| Consulta e acompanhamento de solicitações | Parcial | `GET /api/portal/requests/:contributorId` |
| Integração ao processo e comunicação | Parcial | uso conjunto com `processos`, `comunicacoes`, `dte` no painel operacional |

## Critérios de aceite objetivos

- Requerimento é criado com contribuinte válido.
- Consulta por contribuinte lista histórico ordenado.

## Lacunas para aderência plena

- Falta painel consolidado de regularidade fiscal no portal.
- Falta trilha completa de interação processual do contribuinte.

## Plano de fechamento (curto prazo)

1. Adicionar visão consolidada de pendências/débitos/processos.
2. Permitir anexos e manifestações por etapa processual.
3. Integrar alertas de movimentação no portal.
