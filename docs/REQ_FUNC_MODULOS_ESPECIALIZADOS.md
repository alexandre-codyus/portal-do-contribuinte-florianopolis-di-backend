# Requisitos Funcionais - Módulos Especializados

## Escopo do módulo

Estrutura-base para os módulos especializados previstos no edital.

## Requisitos do edital cobertos

| Requisito (módulo) | Status | Evidência técnica |
|---|---|---|
| DESIF | Parcial | `POST/GET /api/especializados/desif/findings` |
| Auditoria de instituições financeiras | Parcial | `POST/GET /api/especializados/auditoria-if/findings` |
| Construção civil | Parcial | `POST/GET /api/especializados/construcao-civil/findings` |
| NFS-e repertório nacional | Parcial | `POST/GET /api/especializados/nfse-repertorio/findings` |
| Serviços tomados | Parcial | `POST/GET /api/especializados/servicos-tomados/findings` |
| Documentos fiscais | Parcial | `POST/GET /api/especializados/documentos-fiscais/findings` |
| Cruzamento RFB x cadastro municipal | Parcial | `POST/GET /api/especializados/rdb-cadastro-municipal/findings` |

## Critérios de aceite objetivos

- Registro de achado especializado por módulo.
- Listagem de achados por módulo com evidência associada.

## Lacunas para aderência plena

- Falta implementação de regras de negócio específicas por módulo.
- Falta importação de dados reais e painéis dedicados por especialidade.

## Plano de fechamento (curto prazo)

1. Definir backlog por módulo com regras mínimas obrigatórias.
2. Implementar importadores por fonte e saneamento de dados.
3. Criar dashboards e indicadores de efetividade por módulo.
