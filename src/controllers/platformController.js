const platformService = require("../services/platformService");
const auditService = require("../services/auditService");
const {
  validateFiscalCasePayload,
  validateStatusPayload,
  validateProcessPayload,
  validateRegularizationPayload,
  validateProcessEventPayload,
  validateCommunicationPayload,
  validateAinfPayload,
  validateDtePayload,
  validatePortalPayload
} = require("../validators/platformValidator");

async function writeAudit(req, action, before = null, after = null) {
  await auditService.appendLog({
    user: req.user,
    action,
    before,
    after,
    requestMeta: {
      requestId: req.requestId,
      route: req.originalUrl,
      method: req.method
    }
  });
}

async function importAnalytics(req, res) {
  const result = platformService.runAnalyticsImport({
    source: req.body?.source,
    metadata: req.body?.metadata
  });
  return res.status(201).json(result);
}

async function listIndicators(req, res) {
  const severity = req.query.severity;
  const limit = Number(req.query.limit || 50);
  return res.json(platformService.listIndicators({ severity, limit }));
}

async function dashboard(req, res) {
  return res.json(platformService.getDashboard());
}

async function priorities(req, res) {
  const limit = Number(req.query.limit || 20);
  const regimeType = req.query.regimeType;
  return res.json(platformService.listPriorities({ limit, regimeType }));
}

async function createFiscalCase(req, res) {
  validateFiscalCasePayload(req.body);
  const created = platformService.createFiscalCase(req.body);
  await writeAudit(req, "CREATE_FISCAL_CASE", null, created);
  return res.status(201).json(created);
}

async function updateFiscalCaseStatus(req, res) {
  validateStatusPayload(req.body, ["ABERTO", "EM_ANALISE", "EM_REGULARIZACAO", "ENCERRADO"], "status de fiscalizacao");
  const updated = platformService.updateFiscalCaseStatus(req.params.caseId, req.body.status);
  await writeAudit(req, "UPDATE_FISCAL_CASE_STATUS", null, updated);
  return res.json(updated);
}

async function createRegularization(req, res) {
  validateRegularizationPayload(req.body);
  const created = platformService.createRegularization(req.body);
  await writeAudit(req, "CREATE_REGULARIZATION_ACTION", null, created);
  return res.status(201).json(created);
}

async function updateRegularizationStatus(req, res) {
  validateStatusPayload(req.body, ["PENDENTE", "EM_TRATAMENTO", "CONCLUIDA", "NAO_ADERIDA"], "status de regularizacao");
  const updated = platformService.updateRegularizationStatus(req.params.actionId, req.body.status, req.body.resultNotes);
  await writeAudit(req, "UPDATE_REGULARIZATION_STATUS", null, updated);
  return res.json(updated);
}

async function listRegularization(req, res) {
  return res.json(platformService.listRegularization());
}

async function createProcess(req, res) {
  validateProcessPayload(req.body);
  const created = platformService.createProcess(req.body, req.user);
  await writeAudit(req, "CREATE_FISCAL_PROCESS", null, created);
  return res.status(201).json(created);
}

async function updateProcessStatus(req, res) {
  validateStatusPayload(req.body, ["EM_ANDAMENTO", "AGUARDANDO_CIENCIA", "CONCLUIDO", "CANCELADO"], "status de processo");
  const updated = platformService.updateProcessStatus(req.params.processId, req.body.status, req.user);
  await writeAudit(req, "UPDATE_PROCESS_STATUS", null, updated);
  return res.json(updated);
}

async function listProcesses(req, res) {
  return res.json(platformService.listProcesses());
}

async function addProcessEvent(req, res) {
  validateProcessEventPayload(req.body);
  const created = platformService.addProcessEvent(req.params.processId, req.body, req.user);
  await writeAudit(req, "ADD_PROCESS_EVENT", null, created);
  return res.status(201).json(created);
}

async function listProcessEvents(req, res) {
  return res.json(platformService.listProcessEvents(req.params.processId));
}

async function sendCommunication(req, res) {
  validateCommunicationPayload(req.body);
  const created = platformService.sendCommunication(req.body, req.user);
  await writeAudit(req, "SEND_PROCESS_COMMUNICATION", null, created);
  return res.status(201).json(created);
}

async function listProcessCommunications(req, res) {
  return res.json(platformService.listProcessCommunications(req.params.processId));
}

async function createAinf(req, res) {
  validateAinfPayload(req.body);
  const created = platformService.createAinf(req.body, req.user);
  await writeAudit(req, "CREATE_AINF", null, created);
  return res.status(201).json(created);
}

async function updateAinfStatus(req, res) {
  validateStatusPayload(req.body, ["LAVRADO", "NOTIFICADO", "IMPUGNADO", "PAGO", "MANTIDO", "CANCELADO"], "status de AINF");
  const updated = platformService.updateAinfStatus(req.params.ainfId, req.body.status, req.user);
  await writeAudit(req, "UPDATE_AINF_STATUS", null, updated);
  return res.json(updated);
}

async function listAinf(req, res) {
  return res.json(platformService.listAinf());
}

async function createDelegation(req, res) {
  const created = platformService.createDelegation(req.body);
  await writeAudit(req, "CREATE_DTE_DELEGATION", null, created);
  return res.status(201).json(created);
}

async function sendDteMessage(req, res) {
  validateDtePayload(req.body);
  const created = platformService.sendDteMessage(req.body, req.user);
  await writeAudit(req, "SEND_DTE_MESSAGE", null, created);
  return res.status(201).json(created);
}

async function acknowledgeDteMessage(req, res) {
  platformService.acknowledgeDteMessage(req.params.messageId);
  await writeAudit(req, "ACK_DTE_MESSAGE", null, { id: req.params.messageId, status: "CIENTE" });
  return res.status(204).send();
}

async function listDteInbox(req, res) {
  return res.json(platformService.listDteInbox(req.params.contributorId));
}

async function openPortalRequest(req, res) {
  validatePortalPayload(req.body);
  const created = platformService.openPortalRequest(req.body);
  await writeAudit(req, "OPEN_PORTAL_REQUEST", null, created);
  return res.status(201).json(created);
}

async function listPortalRequests(req, res) {
  return res.json(platformService.listPortalRequests(req.params.contributorId));
}

async function createSpecializedFinding(req, res) {
  const created = platformService.registerSpecializedFinding(req.params.module, req.body);
  await writeAudit(req, "CREATE_SPECIALIZED_FINDING", null, created);
  return res.status(201).json(created);
}

async function listSpecializedFindings(req, res) {
  return res.json(platformService.listSpecializedFindings(req.params.module));
}

module.exports = {
  importAnalytics,
  listIndicators,
  dashboard,
  priorities,
  createFiscalCase,
  updateFiscalCaseStatus,
  createRegularization,
  updateRegularizationStatus,
  listRegularization,
  createProcess,
  updateProcessStatus,
  listProcesses,
  addProcessEvent,
  listProcessEvents,
  sendCommunication,
  listProcessCommunications,
  createAinf,
  updateAinfStatus,
  listAinf,
  createDelegation,
  sendDteMessage,
  acknowledgeDteMessage,
  listDteInbox,
  openPortalRequest,
  listPortalRequests,
  createSpecializedFinding,
  listSpecializedFindings
};
