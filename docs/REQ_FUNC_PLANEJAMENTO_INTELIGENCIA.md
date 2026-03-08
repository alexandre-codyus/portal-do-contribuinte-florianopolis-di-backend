# Requisitos Funcionais - Planejamento e Inteligência

## Escopo do módulo

Cobertura das capacidades de ingestão analítica, geração de indicadores, priorização e visualização gerencial.

## Requisitos do edital cobertos

| Requisito (trecho) | Status | Evidência técnica |
|---|---|---|
| Importação/extração de dados para análise | Parcial | `POST /api/analytics/imports`, `platformService.runAnalyticsImport` |
| Identificação de indícios e inconsistências | Parcial | `buildIndicatorRules`, `risk_indicators` |
| Painéis/visões gerenciais e priorização | Parcial | `GET /api/analytics/dashboard`, `GET /api/analytics/priorities`, painel `operacao-fiscal` |
| Rastreabilidade dos resultados analíticos | Atendido | tabela `risk_indicators`, `analytics_imports`, testes de integração |

## Critérios de aceite objetivos

- Importação executa sem erro e retorna `dashboard`.
- Indicadores retornam com severidade e score.
- Priorização retorna fila ordenada por prioridade.

## Lacunas para aderência plena

- Faltam conectores reais de fontes externas (RFB, NFS-e nacional, DESIF).
- Faltam análises multidimensionais avançadas e histórico temporal comparativo.

## Plano de fechamento (curto prazo)

1. Criar adaptadores de ingestão por fonte.
2. Adicionar consultas analíticas por período/segmento.
3. Incluir métricas de efetividade por regra de indício.
