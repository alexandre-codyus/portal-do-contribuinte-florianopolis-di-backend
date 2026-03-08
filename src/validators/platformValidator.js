const { AppError } = require("../errors/AppError");

function requireFields(payload, fields, context) {
  const missing = fields.filter((field) => payload?.[field] === undefined || payload?.[field] === null || payload?.[field] === "");
  if (missing.length > 0) {
    throw new AppError(`Campos obrigatorios ausentes em ${context}.`, 400, { missing });
  }
}

function ensureEnum(value, allowed, context, field) {
  if (!allowed.includes(value)) {
    throw new AppError(`Valor invalido para ${field} em ${context}.`, 400, { allowed });
  }
}

function ensureStringLimit(value, max, field) {
  if (typeof value !== "string") return;
  if (value.length > max) {
    throw new AppError(`Campo ${field} excede tamanho maximo de ${max}.`, 400);
  }
}

function validateFiscalCasePayload(payload) {
  requireFields(payload, ["contributorId", "regimeType", "priority"], "fiscalizacao");
  ensureEnum(payload.regimeType, ["SIMPLES_NACIONAL", "REGIME_GERAL"], "fiscalizacao", "regimeType");
}

function validateStatusPayload(payload, allowedStatuses, context) {
  requireFields(payload, ["status"], context);
  ensureEnum(payload.status, allowedStatuses, context, "status");
}

function validateProcessPayload(payload) {
  requireFields(payload, ["title"], "processo");
  ensureStringLimit(payload.title, 200, "title");
}

function validateRegularizationPayload(payload) {
  requireFields(payload, ["contributorId", "guidance"], "regularizacao");
}

function validateProcessEventPayload(payload) {
  requireFields(payload, ["type", "description"], "evento de processo");
  ensureStringLimit(payload.type, 80, "type");
  ensureStringLimit(payload.description, 500, "description");
}

function validateCommunicationPayload(payload) {
  requireFields(payload, ["processId", "subject", "content"], "comunicacao");
  ensureStringLimit(payload.subject, 200, "subject");
}

function validateAinfPayload(payload) {
  requireFields(payload, ["processId", "contributorId", "periodRef", "taxAmount", "penaltyAmount"], "AINF");
}

function validateDtePayload(payload) {
  requireFields(payload, ["contributorId", "subject", "content"], "DTE");
}

function validatePortalPayload(payload) {
  requireFields(payload, ["contributorId", "type", "title", "description"], "portal");
}

module.exports = {
  validateFiscalCasePayload,
  validateStatusPayload,
  validateProcessPayload,
  validateRegularizationPayload,
  validateProcessEventPayload,
  validateCommunicationPayload,
  validateAinfPayload,
  validateDtePayload,
  validatePortalPayload
};
