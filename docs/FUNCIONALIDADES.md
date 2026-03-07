# Funcionalidades - API

## 1) Healthcheck

- `GET /api/health` retorna status do servico.

## 2) Autenticacao

- `POST /api/auth/login` valida usuario/senha.
- Em sucesso, retorna token JWT e dados do usuario.

## 3) Autorizacao por perfil

Perfis suportados:

- `ADMIN`
- `GESTOR`
- `AUDITOR`
- `LEITOR`

Permissoes para recurso `contributors`:

- `read`: ADMIN, GESTOR, AUDITOR, LEITOR
- `create`: ADMIN, GESTOR
- `update`: ADMIN, GESTOR, AUDITOR
- `delete`: ADMIN

## 4) CRUD de contribuintes

- Lista paginada e com busca (`q`) por documento, tipo, regime e risco.
- Consulta por id.
- Criacao com calculo de score e classificacao de risco.
- Atualizacao com recalculo de score e risco.
- Exclusao por id.

## 5) Regras de score e risco

Sinais usados no calculo:

- inadimplencia
- cnae incompativel
- aliquota divergente
- oscilacao suspeita
- volume (quando informado)

Classificacao:

- `0-30`: Baixo
- `31-60`: Medio
- `61-80`: Alto
- `81-100`: Critico

## 6) Trilha de auditoria

Acoes auditadas:

- `CREATE_CONTRIBUINTE`
- `UPDATE_CONTRIBUINTE`
- `DELETE_CONTRIBUINTE`

Cada log registra:

- usuario
- acao
- timestamp
- estado anterior e/ou posterior
