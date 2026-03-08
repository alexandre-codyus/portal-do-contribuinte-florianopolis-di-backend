const { randomUUID } = require("node:crypto");
const { getDb } = require("../db");

function parseJson(value, fallback = null) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function createAnalyticsImport({ source, status, rowsImported, metadata }) {
  const db = getDb();
  const record = {
    id: randomUUID(),
    source,
    status,
    rows_imported: rowsImported,
    metadata_json: JSON.stringify(metadata || {}),
    created_at: new Date().toISOString()
  };

  db.prepare(`
    INSERT INTO analytics_imports (id, source, status, rows_imported, metadata_json, created_at)
    VALUES (@id, @source, @status, @rows_imported, @metadata_json, @created_at)
  `).run(record);

  return {
    id: record.id,
    source: record.source,
    status: record.status,
    rowsImported: record.rows_imported,
    metadata,
    createdAt: record.created_at
  };
}

function replaceRiskIndicators(indicators) {
  const db = getDb();
  const insertStmt = db.prepare(`
    INSERT INTO risk_indicators (id, contributor_id, rule_code, severity, score, details_json, created_at)
    VALUES (@id, @contributor_id, @rule_code, @severity, @score, @details_json, @created_at)
  `);

  const execute = db.transaction((rows) => {
    db.prepare("DELETE FROM risk_indicators").run();
    for (const row of rows) {
      insertStmt.run({
        id: randomUUID(),
        contributor_id: row.contributorId,
        rule_code: row.ruleCode,
        severity: row.severity,
        score: row.score,
        details_json: JSON.stringify(row.details || {}),
        created_at: new Date().toISOString()
      });
    }
  });

  execute(indicators);
}

function listRiskIndicators({ severity, limit = 50 }) {
  const db = getDb();
  const params = [];
  const where = severity ? "WHERE severity = ?" : "";
  if (severity) params.push(severity);
  params.push(limit);

  const rows = db
    .prepare(`
      SELECT *
      FROM risk_indicators
      ${where}
      ORDER BY score DESC, created_at DESC
      LIMIT ?
    `)
    .all(...params);

  return rows.map((row) => ({
    id: row.id,
    contributorId: row.contributor_id,
    ruleCode: row.rule_code,
    severity: row.severity,
    score: row.score,
    details: parseJson(row.details_json, {}),
    createdAt: row.created_at
  }));
}

function getRiskDashboard() {
  const db = getDb();
  const severityRows = db
    .prepare(`
      SELECT severity, COUNT(*) AS total
      FROM risk_indicators
      GROUP BY severity
      ORDER BY total DESC
    `)
    .all();

  const topContributors = db
    .prepare(`
      SELECT c.id, c.documento, c.tipo, c.regime_tributario, c.grau_risco_atual, c.score_risco
      FROM contributors c
      ORDER BY c.score_risco DESC
      LIMIT 10
    `)
    .all();

  return {
    indicatorsBySeverity: severityRows.map((row) => ({ severity: row.severity, total: row.total })),
    topContributors
  };
}

function listPriorities({ limit = 20, regimeType }) {
  const db = getDb();
  const params = [];
  const where = regimeType ? "WHERE regime_type = ?" : "";
  if (regimeType) params.push(regimeType);
  params.push(limit);

  const rows = db
    .prepare(`
      SELECT fc.*, c.documento, c.tipo, c.regime_tributario
      FROM fiscal_cases fc
      JOIN contributors c ON c.id = fc.contributor_id
      ${where}
      ORDER BY fc.priority DESC, fc.updated_at DESC
      LIMIT ?
    `)
    .all(...params);

  return rows.map((row) => ({
    id: row.id,
    contributorId: row.contributor_id,
    documento: row.documento,
    tipo: row.tipo,
    regimeTributario: row.regime_tributario,
    regimeType: row.regime_type,
    status: row.status,
    priority: row.priority,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

function createFiscalCase({ contributorId, regimeType, priority, notes, originIndicatorId }) {
  const db = getDb();
  const now = new Date().toISOString();
  const record = {
    id: randomUUID(),
    contributor_id: contributorId,
    regime_type: regimeType,
    status: "ABERTO",
    priority: priority || 0,
    notes: notes || null,
    origin_indicator_id: originIndicatorId || null,
    created_at: now,
    updated_at: now
  };

  db.prepare(`
    INSERT INTO fiscal_cases (
      id, contributor_id, regime_type, status, priority, notes, origin_indicator_id, created_at, updated_at
    ) VALUES (
      @id, @contributor_id, @regime_type, @status, @priority, @notes, @origin_indicator_id, @created_at, @updated_at
    )
  `).run(record);

  return {
    id: record.id,
    contributorId: record.contributor_id,
    regimeType: record.regime_type,
    status: record.status,
    priority: record.priority,
    notes: record.notes,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
}

function createRegularization({ fiscalCaseId, contributorId, guidance }) {
  const db = getDb();
  const now = new Date().toISOString();
  const record = {
    id: randomUUID(),
    fiscal_case_id: fiscalCaseId || null,
    contributor_id: contributorId,
    status: "PENDENTE",
    guidance,
    result_notes: null,
    created_at: now,
    updated_at: now
  };

  db.prepare(`
    INSERT INTO regularization_actions (
      id, fiscal_case_id, contributor_id, status, guidance, result_notes, created_at, updated_at
    ) VALUES (
      @id, @fiscal_case_id, @contributor_id, @status, @guidance, @result_notes, @created_at, @updated_at
    )
  `).run(record);

  return {
    id: record.id,
    fiscalCaseId: record.fiscal_case_id,
    contributorId: record.contributor_id,
    status: record.status,
    guidance: record.guidance,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
}

function listRegularizationActions() {
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT ra.*, c.documento
      FROM regularization_actions ra
      JOIN contributors c ON c.id = ra.contributor_id
      ORDER BY ra.updated_at DESC
    `)
    .all();

  return rows.map((row) => ({
    id: row.id,
    fiscalCaseId: row.fiscal_case_id,
    contributorId: row.contributor_id,
    documento: row.documento,
    status: row.status,
    guidance: row.guidance,
    resultNotes: row.result_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

function createFiscalProcess({ fiscalCaseId, title, stage, dueDate }) {
  const db = getDb();
  const now = new Date().toISOString();
  const record = {
    id: randomUUID(),
    fiscal_case_id: fiscalCaseId || null,
    title,
    status: "EM_ANDAMENTO",
    current_stage: stage || "ANALISE_INICIAL",
    due_date: dueDate || null,
    created_at: now,
    updated_at: now
  };

  db.prepare(`
    INSERT INTO fiscal_processes (id, fiscal_case_id, title, status, current_stage, due_date, created_at, updated_at)
    VALUES (@id, @fiscal_case_id, @title, @status, @current_stage, @due_date, @created_at, @updated_at)
  `).run(record);

  return {
    id: record.id,
    fiscalCaseId: record.fiscal_case_id,
    title: record.title,
    status: record.status,
    currentStage: record.current_stage,
    dueDate: record.due_date,
    createdAt: record.created_at
  };
}

function listFiscalProcesses() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM fiscal_processes ORDER BY updated_at DESC").all();
  return rows.map((row) => ({
    id: row.id,
    fiscalCaseId: row.fiscal_case_id,
    title: row.title,
    status: row.status,
    currentStage: row.current_stage,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

function addProcessEvent({ processId, type, description, actorUsername, payload }) {
  const db = getDb();
  const record = {
    id: randomUUID(),
    process_id: processId,
    type,
    description,
    actor_username: actorUsername || null,
    payload_json: payload ? JSON.stringify(payload) : null,
    created_at: new Date().toISOString()
  };

  db.prepare(`
    INSERT INTO process_events (id, process_id, type, description, actor_username, payload_json, created_at)
    VALUES (@id, @process_id, @type, @description, @actor_username, @payload_json, @created_at)
  `).run(record);

  return {
    id: record.id,
    processId: record.process_id,
    type: record.type,
    description: record.description,
    actorUsername: record.actor_username,
    payload,
    createdAt: record.created_at
  };
}

function listProcessEvents(processId) {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM process_events WHERE process_id = ? ORDER BY created_at ASC")
    .all(processId);
  return rows.map((row) => ({
    id: row.id,
    processId: row.process_id,
    type: row.type,
    description: row.description,
    actorUsername: row.actor_username,
    payload: parseJson(row.payload_json, null),
    createdAt: row.created_at
  }));
}

function createCommunication({ processId, contributorId, channel, subject, content }) {
  const db = getDb();
  const record = {
    id: randomUUID(),
    process_id: processId || null,
    contributor_id: contributorId || null,
    channel: channel || "DTE",
    subject,
    content,
    status: "ENVIADA",
    sent_at: new Date().toISOString(),
    read_at: null
  };

  db.prepare(`
    INSERT INTO communications (id, process_id, contributor_id, channel, subject, content, status, sent_at, read_at)
    VALUES (@id, @process_id, @contributor_id, @channel, @subject, @content, @status, @sent_at, @read_at)
  `).run(record);

  return {
    id: record.id,
    processId: record.process_id,
    contributorId: record.contributor_id,
    channel: record.channel,
    subject: record.subject,
    status: record.status,
    sentAt: record.sent_at
  };
}

function createAinfRecord(payload) {
  const db = getDb();
  const record = {
    id: randomUUID(),
    process_id: payload.processId || null,
    fiscal_case_id: payload.fiscalCaseId || null,
    contributor_id: payload.contributorId,
    period_ref: payload.periodRef,
    tax_amount: payload.taxAmount,
    penalty_amount: payload.penaltyAmount,
    total_amount: payload.totalAmount,
    legal_basis: payload.legalBasis || null,
    status: payload.status || "LAVRADO",
    created_at: new Date().toISOString()
  };

  db.prepare(`
    INSERT INTO ainf_records (
      id, process_id, fiscal_case_id, contributor_id, period_ref, tax_amount,
      penalty_amount, total_amount, legal_basis, status, created_at
    ) VALUES (
      @id, @process_id, @fiscal_case_id, @contributor_id, @period_ref, @tax_amount,
      @penalty_amount, @total_amount, @legal_basis, @status, @created_at
    )
  `).run(record);

  return {
    id: record.id,
    processId: record.process_id,
    fiscalCaseId: record.fiscal_case_id,
    contributorId: record.contributor_id,
    periodRef: record.period_ref,
    taxAmount: record.tax_amount,
    penaltyAmount: record.penalty_amount,
    totalAmount: record.total_amount,
    status: record.status,
    createdAt: record.created_at
  };
}

function listAinfRecords() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM ainf_records ORDER BY created_at DESC").all();
  return rows.map((row) => ({
    id: row.id,
    processId: row.process_id,
    fiscalCaseId: row.fiscal_case_id,
    contributorId: row.contributor_id,
    periodRef: row.period_ref,
    taxAmount: row.tax_amount,
    penaltyAmount: row.penalty_amount,
    totalAmount: row.total_amount,
    legalBasis: row.legal_basis,
    status: row.status,
    createdAt: row.created_at
  }));
}

function createDelegation({ contributorDocument, representativeDocument, permissions }) {
  const db = getDb();
  const record = {
    id: randomUUID(),
    contributor_document: contributorDocument,
    representative_document: representativeDocument,
    permissions_json: JSON.stringify(permissions || []),
    status: "ATIVA",
    created_at: new Date().toISOString()
  };

  db.prepare(`
    INSERT INTO delegations (id, contributor_document, representative_document, permissions_json, status, created_at)
    VALUES (@id, @contributor_document, @representative_document, @permissions_json, @status, @created_at)
  `).run(record);

  return {
    id: record.id,
    contributorDocument: record.contributor_document,
    representativeDocument: record.representative_document,
    permissions,
    status: record.status,
    createdAt: record.created_at
  };
}

function createDteMessage({ contributorId, processId, subject, content }) {
  const db = getDb();
  const record = {
    id: randomUUID(),
    contributor_id: contributorId,
    process_id: processId || null,
    subject,
    content,
    status: "ENVIADA",
    sent_at: new Date().toISOString(),
    science_at: null
  };

  db.prepare(`
    INSERT INTO dte_messages (id, contributor_id, process_id, subject, content, status, sent_at, science_at)
    VALUES (@id, @contributor_id, @process_id, @subject, @content, @status, @sent_at, @science_at)
  `).run(record);

  return {
    id: record.id,
    contributorId: record.contributor_id,
    processId: record.process_id,
    subject: record.subject,
    content: record.content,
    status: record.status,
    sentAt: record.sent_at
  };
}

function acknowledgeDteMessage(messageId) {
  const db = getDb();
  const scienceAt = new Date().toISOString();
  const result = db
    .prepare(`
      UPDATE dte_messages
      SET status = 'CIENTE', science_at = ?
      WHERE id = ?
    `)
    .run(scienceAt, messageId);
  return result.changes > 0;
}

function listDteMessagesByContributor(contributorId) {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM dte_messages WHERE contributor_id = ? ORDER BY sent_at DESC")
    .all(contributorId);
  return rows.map((row) => ({
    id: row.id,
    contributorId: row.contributor_id,
    processId: row.process_id,
    subject: row.subject,
    content: row.content,
    status: row.status,
    sentAt: row.sent_at,
    scienceAt: row.science_at
  }));
}

function createPortalRequest({ contributorId, type, title, description, attachments }) {
  const db = getDb();
  const now = new Date().toISOString();
  const record = {
    id: randomUUID(),
    contributor_id: contributorId,
    type,
    title,
    description,
    attachments_json: JSON.stringify(attachments || []),
    status: "ABERTO",
    created_at: now,
    updated_at: now
  };

  db.prepare(`
    INSERT INTO portal_requests (
      id, contributor_id, type, title, description, attachments_json, status, created_at, updated_at
    ) VALUES (
      @id, @contributor_id, @type, @title, @description, @attachments_json, @status, @created_at, @updated_at
    )
  `).run(record);

  return {
    id: record.id,
    contributorId: record.contributor_id,
    type: record.type,
    title: record.title,
    description: record.description,
    attachments: attachments || [],
    status: record.status,
    createdAt: record.created_at
  };
}

function listPortalRequestsByContributor(contributorId) {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM portal_requests WHERE contributor_id = ? ORDER BY updated_at DESC")
    .all(contributorId);

  return rows.map((row) => ({
    id: row.id,
    contributorId: row.contributor_id,
    type: row.type,
    title: row.title,
    description: row.description,
    attachments: parseJson(row.attachments_json, []),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

function createSpecializedFinding({ module, contributorId, title, severity, evidence }) {
  const db = getDb();
  const record = {
    id: randomUUID(),
    module,
    contributor_id: contributorId || null,
    title,
    severity: severity || "MEDIA",
    status: "ABERTO",
    evidence_json: JSON.stringify(evidence || {}),
    created_at: new Date().toISOString()
  };

  db.prepare(`
    INSERT INTO specialized_findings (id, module, contributor_id, title, severity, status, evidence_json, created_at)
    VALUES (@id, @module, @contributor_id, @title, @severity, @status, @evidence_json, @created_at)
  `).run(record);

  return {
    id: record.id,
    module: record.module,
    contributorId: record.contributor_id,
    title: record.title,
    severity: record.severity,
    status: record.status,
    evidence: evidence || {},
    createdAt: record.created_at
  };
}

function listSpecializedFindings(module) {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM specialized_findings WHERE module = ? ORDER BY created_at DESC")
    .all(module);
  return rows.map((row) => ({
    id: row.id,
    module: row.module,
    contributorId: row.contributor_id,
    title: row.title,
    severity: row.severity,
    status: row.status,
    evidence: parseJson(row.evidence_json, {}),
    createdAt: row.created_at
  }));
}

function contributorExists(contributorId) {
  const db = getDb();
  const row = db.prepare("SELECT id FROM contributors WHERE id = ?").get(contributorId);
  return Boolean(row);
}

module.exports = {
  createAnalyticsImport,
  replaceRiskIndicators,
  listRiskIndicators,
  getRiskDashboard,
  listPriorities,
  createFiscalCase,
  createRegularization,
  listRegularizationActions,
  createFiscalProcess,
  listFiscalProcesses,
  addProcessEvent,
  listProcessEvents,
  createCommunication,
  createAinfRecord,
  listAinfRecords,
  createDelegation,
  createDteMessage,
  acknowledgeDteMessage,
  listDteMessagesByContributor,
  createPortalRequest,
  listPortalRequestsByContributor,
  createSpecializedFinding,
  listSpecializedFindings,
  contributorExists
};
