# API - Inteligencia Fiscal POC

API REST em Node.js/Express para autenticacao, autorizacao por perfil e gestao de contribuintes.

## Documentacao deste projeto

- Visao tecnologica: `docs/TECNOLOGIA.md`
- Visao funcional: `docs/FUNCIONALIDADES.md`
- Referencias: `docs/REFERENCIAS.md`

## Como executar

1. Instale dependencias:

```bash
npm install
```

2. Configure ambiente:

- Ja existe `\.env.local` criado a partir de `\.env.example`.
- Se preferir, tambem pode usar `\.env`.

3. Rode em desenvolvimento:

```bash
npm run dev
```

4. API disponivel em:

- `http://localhost:3333/api`

## Endpoints principais

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/contributors`
- `GET /api/contributors/:id`
- `POST /api/contributors`
- `PUT /api/contributors/:id`
- `DELETE /api/contributors/:id`

## Perfis para login

- `admin / admin123`
- `gestor / gestor123`
- `auditor / auditor123`
- `leitor / leitor123`
