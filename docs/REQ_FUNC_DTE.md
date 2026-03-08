# Requisitos Funcionais - Domicílio Tributário Eletrônico (DTE)

## Escopo do módulo

Envio de comunicações eletrônicas formais, delegações e ciência eletrônica.

## Requisitos do edital cobertos

| Requisito (trecho) | Status | Evidência técnica |
|---|---|---|
| Publicação de comunicação eletrônica | Parcial | `POST /api/dte/messages` |
| Controle de ciência eletrônica | Parcial | `POST /api/dte/messages/:messageId/ack` com regra de status |
| Caixa de mensagens por contribuinte | Parcial | `GET /api/dte/inbox/:contributorId` |
| Delegações de acesso/representação | Parcial | `POST /api/dte/delegations` |

## Critérios de aceite objetivos

- Mensagem é criada com `status=ENVIADA`.
- Ciência só ocorre para mensagem elegível.
- Inbox retorna histórico com `sentAt/scienceAt`.

## Lacunas para aderência plena

- Falta controle de decurso de prazo automático.
- Falta gestão robusta de perfis/delegações com validade e revogação detalhada.

## Plano de fechamento (curto prazo)

1. Implementar job de ciência por decurso.
2. Adicionar validade/revogação de delegação.
3. Incluir alertas de mensagens não lidas por perfil.
