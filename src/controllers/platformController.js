const platformService = require("../services/platformService");

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
  const created = platformService.createFiscalCase(req.body);
  return res.status(201).json(created);
}

async function createRegularization(req, res) {
  const created = platformService.createRegularization(req.body);
  return res.status(201).json(created);
}

async function listRegularization(req, res) {
  return res.json(platformService.listRegularization());
}

async function createProcess(req, res) {
  const created = platformService.createProcess(req.body, req.user);
  return res.status(201).json(created);
}

async function listProcesses(req, res) {
  return res.json(platformService.listProcesses());
}

async function addProcessEvent(req, res) {
  const created = platformService.addProcessEvent(req.params.processId, req.body, req.user);
  return res.status(201).json(created);
}

async function listProcessEvents(req, res) {
  return res.json(platformService.listProcessEvents(req.params.processId));
}

async function sendCommunication(req, res) {
  const created = platformService.sendCommunication(req.body, req.user);
  return res.status(201).json(created);
}

async function createAinf(req, res) {
  const created = platformService.createAinf(req.body, req.user);
  return res.status(201).json(created);
}

async function listAinf(req, res) {
  return res.json(platformService.listAinf());
}

async function createDelegation(req, res) {
  const created = platformService.createDelegation(req.body);
  return res.status(201).json(created);
}

async function sendDteMessage(req, res) {
  const created = platformService.sendDteMessage(req.body, req.user);
  return res.status(201).json(created);
}

async function acknowledgeDteMessage(req, res) {
  platformService.acknowledgeDteMessage(req.params.messageId);
  return res.status(204).send();
}

async function listDteInbox(req, res) {
  return res.json(platformService.listDteInbox(req.params.contributorId));
}

async function openPortalRequest(req, res) {
  const created = platformService.openPortalRequest(req.body);
  return res.status(201).json(created);
}

async function listPortalRequests(req, res) {
  return res.json(platformService.listPortalRequests(req.params.contributorId));
}

async function createSpecializedFinding(req, res) {
  const created = platformService.registerSpecializedFinding(req.params.module, req.body);
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
  createRegularization,
  listRegularization,
  createProcess,
  listProcesses,
  addProcessEvent,
  listProcessEvents,
  sendCommunication,
  createAinf,
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
