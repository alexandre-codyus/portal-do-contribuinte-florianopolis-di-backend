const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "integration-test-secret";
const app = require("../src/app");

let token;
let contributorId;
let processId;
let dteMessageId;

test("healthcheck deve responder 200", async () => {
  const res = await request(app).get("/api/health");
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, "ok");
});

test("login deve retornar token", async () => {
  const res = await request(app).post("/api/auth/login").send({
    username: "admin",
    password: "admin123"
  });
  assert.equal(res.statusCode, 200);
  assert.ok(res.body.token);
  token = res.body.token;
});

test("deve listar contribuintes com autenticacao", async () => {
  const res = await request(app).get("/api/contributors").set("Authorization", `Bearer ${token}`);
  assert.equal(res.statusCode, 200);
  assert.ok(Array.isArray(res.body.data));
});

test("deve criar contribuinte e abrir processo fiscal", async () => {
  const createdContributor = await request(app)
    .post("/api/contributors")
    .set("Authorization", `Bearer ${token}`)
    .send({
      tipo: "PJ",
      documento: `${Date.now()}000199`,
      natureza_juridica: "Sociedade Empresaria Limitada",
      regime_tributario: "Lucro Presumido",
      cnae_principal: "6201501",
      optante_simples: "false",
      historico_situacoes: "[]",
      inadimplente: "true",
      cnae_incompativel: "false",
      aliquota_divergente: "true",
      oscilacao_suspeita: "false",
      volume_indice: 80
    });

  assert.equal(createdContributor.statusCode, 201);
  contributorId = createdContributor.body.id;

  const createdCase = await request(app)
    .post("/api/fiscalizacao/cases")
    .set("Authorization", `Bearer ${token}`)
    .send({
      contributorId,
      regimeType: "SIMPLES_NACIONAL",
      priority: 90,
      notes: "Teste de fiscalizacao"
    });

  assert.equal(createdCase.statusCode, 201);

  const createdProcess = await request(app)
    .post("/api/processos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      fiscalCaseId: createdCase.body.id,
      title: "Processo de teste",
      stage: "ANALISE_INICIAL"
    });

  assert.equal(createdProcess.statusCode, 201);
  processId = createdProcess.body.id;
});

test("deve executar analytics e criar AINF", async () => {
  const importRes = await request(app)
    .post("/api/analytics/imports")
    .set("Authorization", `Bearer ${token}`)
    .send({ source: "TESTE" });
  assert.equal(importRes.statusCode, 201);

  const ainfRes = await request(app)
    .post("/api/ainf")
    .set("Authorization", `Bearer ${token}`)
    .send({
      processId,
      contributorId,
      periodRef: "2026-01",
      taxAmount: 1000,
      penaltyAmount: 200,
      legalBasis: "LC 123"
    });
  assert.equal(ainfRes.statusCode, 201);
  assert.equal(ainfRes.body.totalAmount, 1200);
});

test("deve enviar DTE e abrir solicitacao portal", async () => {
  const dteRes = await request(app)
    .post("/api/dte/messages")
    .set("Authorization", `Bearer ${token}`)
    .send({
      contributorId,
      processId,
      subject: "Notificacao de teste",
      content: "Conteudo da notificacao"
    });
  assert.equal(dteRes.statusCode, 201);
  dteMessageId = dteRes.body.id;

  const ackRes = await request(app)
    .post(`/api/dte/messages/${dteMessageId}/ack`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(ackRes.statusCode, 204);

  const portalRes = await request(app)
    .post("/api/portal/requests")
    .set("Authorization", `Bearer ${token}`)
    .send({
      contributorId,
      type: "PARCELAMENTO",
      title: "Pedido de parcelamento",
      description: "Solicito parcelamento do debito."
    });
  assert.equal(portalRes.statusCode, 201);
});
