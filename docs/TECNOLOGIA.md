# Tecnologia - API

## Stack principal

- Node.js
- Express
- JWT (`jsonwebtoken`)
- Dotenv
- CORS

## Arquitetura

Estrutura em camadas simples:

- `src/routes`: definicao de endpoints
- `src/controllers`: orquestracao HTTP
- `src/services`: regras de negocio (acesso, autenticacao, score, auditoria)
- `src/repositories`: acesso a persistencia em arquivo JSON
- `src/middlewares`: autenticacao e autorizacao
- `src/config`: configuracoes estaticas (usuarios mockados)

## Persistencia

- Contribuintes: `data/contribuintes.json`
- Auditoria: `data/audit-log.json`

Nao usa banco relacional nesta POC; a persistencia e em arquivo local.

## Seguranca

- Token JWT no cabecalho `Authorization: Bearer <token>`
- Controle de acesso por perfil no middleware `authorize`

## Scripts

- `npm run dev`: executa com `node --watch`
- `npm start`: executa em modo normal
