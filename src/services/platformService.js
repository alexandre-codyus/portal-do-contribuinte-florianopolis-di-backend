const contributorsRepository = require("../repositories/contributorsRepository");
const platformRepository = require("../repositories/platformRepository");
const { AppError } = require("../errors/AppError");

const fiscalCaseTransitions = {
  ABERTO: ["EM_ANALISE", "ENCERRADO"],
  EM_ANALISE: ["EM_REGULARIZACAO", "ENCERRADO"],
  EM_REGULARIZACAO: ["ENCERRADO"],
  ENCERRADO: []
};

const regularizationTransitions = {
  PENDENTE: ["EM_TRATAMENTO", "CONCLUIDA", "NAO_ADERIDA"],
  EM_TRATAMENTO: ["CONCLUIDA", "NAO_ADERIDA"],
  CONCLUIDA: [],
  NAO_ADERIDA: []
};

const processTransitions = {
  EM_ANDAMENTO: ["AGUARDANDO_CIENCIA", "CONCLUIDO", "CANCELADO"],
  AGUARDANDO_CIENCIA: ["EM_ANDAMENTO", "CONCLUIDO", "CANCELADO"],
  CONCLUIDO: [],
  CANCELADO: []
};

const ainfTransitions = {
  LAVRADO: ["NOTIFICADO", "CANCELADO"],
  NOTIFICADO: ["PAGO", "IMPUGNADO", "CANCELADO"],
  IMPUGNADO: ["MANTIDO", "CANCELADO"],
  PAGO: [],
  MANTIDO: [],
  CANCELADO: []
};

function severityFromScore(score) {
  if (score >= 85) return "CRITICA";
  if (score >= 70) return "ALTA";
  if (score >= 45) return "MEDIA";
  return "BAIXA";
}

function ensureTransition(entity, currentStatus, nextStatus, map) {
  const allowed = map[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(`Transicao invalida para ${entity}: ${currentStatus} -> ${nextStatus}.`, 409, {
      currentStatus,
      nextStatus,
      allowed
    });
  }
}

function buildIndicatorRules(contributor) {
  const indicators = [];
  const score = Number(contributor.score_risco || 0);

  if (score >= 70) {
    indicators.push({
      contributorId: contributor.id,
      ruleCode: "SCORE_RISCO_ELEVADO",
      severity: severityFromScore(score),
      score,
      details: {
        scoreRisco: score,
        regime: contributor.regime_tributario
      }
    });
  }

  if (contributor.inadimplente === "true") {
    indicators.push({
      contributorId: contributor.id,
      ruleCode: "INADIMPLENCIA_ATIVA",
      severity: "ALTA",
      score: Math.max(score, 75),
      details: {
        documento: contributor.documento
      }
    });
  }

  if (contributor.aliquota_divergente === "true" || contributor.cnae_incompativel === "true") {
    indicators.push({
      contributorId: contributor.id,
      ruleCode: "DIVERGENCIA_DECLARATORIA",
      severity: "MEDIA",
      score: Math.max(score, 55),
      details: {
        aliquotaDivergente: contributor.aliquota_divergente,
        cnaeIncompativel: contributor.cnae_incompativel
      }
    });
  }

  return indicators;
}

function runAnalyticsImport({ source, metadata }) {
  const contributors = contributorsRepository.list();
  const indicators = contributors.flatMap(buildIndicatorRules);
  platformRepository.replaceRiskIndicators(indicators);
  const dashboard = platformRepository.getRiskDashboard();
  const importRecord = platformRepository.createAnalyticsImport({
    source: source || "MANUAL",
    status: "CONCLUIDO",
    rowsImported: contributors.length,
    metadata: {
      ...metadata,
      indicatorsGenerated: indicators.length
    }
  });

  return {
    importRecord,
    dashboard
  };
}

function listIndicators({ severity, limit }) {
  return platformRepository.listRiskIndicators({ severity, limit });
}

function getDashboard() {
  return platformRepository.getRiskDashboard();
}

function listPriorities({ limit, regimeType }) {
  return platformRepository.listPriorities({ limit, regimeType });
}

function createFiscalCase(payload) {
  if (!platformRepository.contributorExists(payload.contributorId)) {
    throw new AppError("Contribuinte nao encontrado para abertura de fiscalizacao.", 404);
  }

  return platformRepository.createFiscalCase(payload);
}

function updateFiscalCaseStatus(fiscalCaseId, nextStatus) {
  const current = platformRepository.getFiscalCaseById(fiscalCaseId);
  if (!current) {
    throw new AppError("Caso de fiscalizacao nao encontrado.", 404);
  }
  ensureTransition("fiscal_case", current.status, nextStatus, fiscalCaseTransitions);
  platformRepository.updateFiscalCaseStatus(fiscalCaseId, nextStatus);
  return platformRepository.getFiscalCaseById(fiscalCaseId);
}

function createRegularization(payload) {
  if (!platformRepository.contributorExists(payload.contributorId)) {
    throw new AppError("Contribuinte nao encontrado para regularizacao.", 404);
  }
  if (payload.fiscalCaseId && !platformRepository.fiscalCaseExists(payload.fiscalCaseId)) {
    throw new AppError("Caso fiscal nao encontrado para regularizacao.", 404);
  }
  return platformRepository.createRegularization(payload);
}

function updateRegularizationStatus(actionId, nextStatus, resultNotes) {
  const current = platformRepository.getRegularizationById(actionId);
  if (!current) {
    throw new AppError("Acao de regularizacao nao encontrada.", 404);
  }
  ensureTransition("regularization", current.status, nextStatus, regularizationTransitions);
  platformRepository.updateRegularizationStatus(actionId, nextStatus, resultNotes);
  return platformRepository.getRegularizationById(actionId);
}

function listRegularization() {
  return platformRepository.listRegularizationActions();
}

function createProcess(payload, user) {
  if (payload.fiscalCaseId && !platformRepository.fiscalCaseExists(payload.fiscalCaseId)) {
    throw new AppError("Caso fiscal nao encontrado para criar processo.", 404);
  }
  const created = platformRepository.createFiscalProcess(payload);
  platformRepository.addProcessEvent({
    processId: created.id,
    type: "CRIACAO_PROCESSO",
    description: "Processo fiscal criado",
    actorUsername: user?.username || "sistema",
    payload
  });
  return created;
}

function updateProcessStatus(processId, nextStatus, user) {
  const current = platformRepository.getFiscalProcessById(processId);
  if (!current) {
    throw new AppError("Processo fiscal nao encontrado.", 404);
  }
  ensureTransition("fiscal_process", current.status, nextStatus, processTransitions);
  platformRepository.updateProcessStatus(processId, nextStatus);
  platformRepository.addProcessEvent({
    processId,
    type: "STATUS_PROCESSO_ATUALIZADO",
    description: `Status atualizado para ${nextStatus}`,
    actorUsername: user?.username || "sistema",
    payload: { previousStatus: current.status, nextStatus }
  });
  return platformRepository.getFiscalProcessById(processId);
}

function listProcesses() {
  return platformRepository.listFiscalProcesses();
}

function addProcessEvent(processId, payload, user) {
  if (!platformRepository.processExists(processId)) {
    throw new AppError("Processo fiscal nao encontrado para registrar evento.", 404);
  }
  return platformRepository.addProcessEvent({
    processId,
    type: payload.type || "ATUALIZACAO",
    description: payload.description || "Atualizacao registrada",
    actorUsername: user?.username || "sistema",
    payload: payload.payload || null
  });
}

function listProcessEvents(processId) {
  return platformRepository.listProcessEvents(processId);
}

function sendCommunication(payload, user) {
  if (!payload.processId || !platformRepository.processExists(payload.processId)) {
    throw new AppError("Processo fiscal valido e obrigatorio para comunicacao.", 400);
  }
  const communication = platformRepository.createCommunication(payload);
  if (payload.processId) {
    platformRepository.addProcessEvent({
      processId: payload.processId,
      type: "COMUNICACAO_ENVIADA",
      description: payload.subject,
      actorUsername: user?.username || "sistema",
      payload: {
        communicationId: communication.id,
        channel: communication.channel
      }
    });
  }
  return communication;
}

function listProcessCommunications(processId) {
  if (!platformRepository.processExists(processId)) {
    throw new AppError("Processo fiscal nao encontrado para listagem de comunicacoes.", 404);
  }
  return platformRepository.listCommunicationsByProcess(processId);
}

function createAinf(payload, user) {
  if (!payload.processId || !platformRepository.processExists(payload.processId)) {
    throw new AppError("AINF exige processo fiscal valido.", 400);
  }
  if (!platformRepository.contributorExists(payload.contributorId)) {
    throw new AppError("Contribuinte nao encontrado para AINF.", 404);
  }
  const totalAmount = Number(payload.taxAmount || 0) + Number(payload.penaltyAmount || 0);
  const created = platformRepository.createAinfRecord({
    ...payload,
    totalAmount
  });

  if (payload.processId) {
    platformRepository.addProcessEvent({
      processId: payload.processId,
      type: "AINF_LAVRADO",
      description: `AINF ${created.id} lavrado`,
      actorUsername: user?.username || "sistema",
      payload: {
        ainfId: created.id,
        periodRef: created.periodRef,
        totalAmount
      }
    });
  }

  return created;
}

function updateAinfStatus(ainfId, nextStatus, user) {
  const current = platformRepository.getAinfById(ainfId);
  if (!current) {
    throw new AppError("AINF nao encontrado.", 404);
  }
  ensureTransition("ainf", current.status, nextStatus, ainfTransitions);
  platformRepository.updateAinfStatus(ainfId, nextStatus);
  if (current.processId) {
    platformRepository.addProcessEvent({
      processId: current.processId,
      type: "STATUS_AINF_ATUALIZADO",
      description: `AINF ${ainfId} atualizado para ${nextStatus}`,
      actorUsername: user?.username || "sistema",
      payload: { previousStatus: current.status, nextStatus }
    });
  }
  return platformRepository.getAinfById(ainfId);
}

function listAinf() {
  return platformRepository.listAinfRecords();
}

function createDelegation(payload) {
  return platformRepository.createDelegation(payload);
}

function sendDteMessage(payload, user) {
  if (!platformRepository.contributorExists(payload.contributorId)) {
    throw new AppError("Contribuinte nao encontrado para DTE.", 404);
  }

  const message = platformRepository.createDteMessage(payload);
  if (payload.processId) {
    platformRepository.addProcessEvent({
      processId: payload.processId,
      type: "DTE_PUBLICADO",
      description: payload.subject,
      actorUsername: user?.username || "sistema",
      payload: { dteMessageId: message.id }
    });
  }
  return message;
}

function acknowledgeDteMessage(messageId) {
  const message = platformRepository.getDteMessageById(messageId);
  if (!message) {
    throw new AppError("Mensagem DTE nao encontrada.", 404);
  }
  if (message.status !== "ENVIADA") {
    throw new AppError("Apenas mensagens ENVIADAS podem receber ciencia.", 409, {
      currentStatus: message.status
    });
  }
  const changed = platformRepository.acknowledgeDteMessage(messageId);
  if (!changed) {
    throw new AppError("Mensagem DTE nao encontrada.", 404);
  }
}

function listDteInbox(contributorId) {
  return platformRepository.listDteMessagesByContributor(contributorId);
}

function openPortalRequest(payload) {
  if (!platformRepository.contributorExists(payload.contributorId)) {
    throw new AppError("Contribuinte nao encontrado para portal.", 404);
  }
  return platformRepository.createPortalRequest(payload);
}

function listPortalRequests(contributorId) {
  return platformRepository.listPortalRequestsByContributor(contributorId);
}

function registerSpecializedFinding(module, payload) {
  if (payload.contributorId && !platformRepository.contributorExists(payload.contributorId)) {
    throw new AppError("Contribuinte nao encontrado para o modulo especializado.", 404);
  }
  return platformRepository.createSpecializedFinding({
    module,
    ...payload
  });
}

function listSpecializedFindings(module) {
  return platformRepository.listSpecializedFindings(module);
}

module.exports = {
  runAnalyticsImport,
  listIndicators,
  getDashboard,
  listPriorities,
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
  registerSpecializedFinding,
  listSpecializedFindings
};
