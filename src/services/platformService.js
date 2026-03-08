const contributorsRepository = require("../repositories/contributorsRepository");
const platformRepository = require("../repositories/platformRepository");
const { AppError } = require("../errors/AppError");

function severityFromScore(score) {
  if (score >= 85) return "CRITICA";
  if (score >= 70) return "ALTA";
  if (score >= 45) return "MEDIA";
  return "BAIXA";
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

function createRegularization(payload) {
  if (!platformRepository.contributorExists(payload.contributorId)) {
    throw new AppError("Contribuinte nao encontrado para regularizacao.", 404);
  }
  return platformRepository.createRegularization(payload);
}

function listRegularization() {
  return platformRepository.listRegularizationActions();
}

function createProcess(payload, user) {
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

function listProcesses() {
  return platformRepository.listFiscalProcesses();
}

function addProcessEvent(processId, payload, user) {
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

function createAinf(payload, user) {
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
  registerSpecializedFinding,
  listSpecializedFindings
};
