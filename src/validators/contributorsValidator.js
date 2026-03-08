const { AppError } = require("../errors/AppError");

const requiredFields = [
  "tipo",
  "documento",
  "natureza_juridica",
  "regime_tributario",
  "cnae_principal",
  "optante_simples",
  "historico_situacoes",
  "inadimplente",
  "cnae_incompativel",
  "aliquota_divergente",
  "oscilacao_suspeita"
];

function validateCreatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new AppError("Payload invalido para contribuinte.", 400);
  }

  const missing = requiredFields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === "");
  if (missing.length > 0) {
    throw new AppError("Campos obrigatorios ausentes.", 400, { missing });
  }
}

function validatePagination(page, pageSize) {
  if (Number.isNaN(page) || page < 1) {
    throw new AppError("Parametro page invalido.", 400);
  }
  if (Number.isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new AppError("Parametro pageSize invalido. Use entre 1 e 100.", 400);
  }
}

module.exports = {
  validateCreatePayload,
  validatePagination
};
