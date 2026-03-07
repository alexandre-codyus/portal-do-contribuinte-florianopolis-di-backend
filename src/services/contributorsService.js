const repository = require("../repositories/contributorsRepository");

function normalizeBooleanFields(payload) {
  const fields = ["inadimplente", "cnae_incompativel", "aliquota_divergente", "oscilacao_suspeita", "optante_simples"];
  const result = { ...payload };

  for (const field of fields) {
    if (field in result) {
      const value = result[field];
      if (typeof value === "boolean") {
        result[field] = value ? "true" : "false";
      }
    }
  }

  return result;
}

function classifyRisk(score) {
  if (score <= 30) return "Baixo";
  if (score <= 60) return "Medio";
  if (score <= 80) return "Alto";
  return "Critico";
}

function calculateScoreFromFlags(input) {
  const inadimplente = input.inadimplente === "true";
  const cnaeIncompativel = input.cnae_incompativel === "true";
  const aliquotaDivergente = input.aliquota_divergente === "true";
  const oscilacaoSuspeita = input.oscilacao_suspeita === "true";

  const volume = Number(input.volume_indice ?? 50);
  const inadimplencia = inadimplente ? 85 : 15;
  const conformidade = cnaeIncompativel || aliquotaDivergente ? 80 : 25;
  const historico = oscilacaoSuspeita ? 75 : 20;

  return Number(((volume * 0.3) + (inadimplencia * 0.4) + (conformidade * 0.2) + (historico * 0.1)).toFixed(2));
}

async function list({ q, page = 1, pageSize = 20 }) {
  const contributors = await repository.list();
  const filtered = q
    ? contributors.filter((item) => {
      const term = q.toLowerCase();
      return (
        item.documento?.toLowerCase().includes(term) ||
          item.tipo?.toLowerCase().includes(term) ||
          item.regime_tributario?.toLowerCase().includes(term) ||
          item.grau_risco_atual?.toLowerCase().includes(term)
      );
    })
    : contributors;

  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    data: filtered.slice(start, end),
    total: filtered.length,
    page,
    pageSize
  };
}

async function getById(id) {
  return repository.findById(id);
}

async function create(payload) {
  const normalized = normalizeBooleanFields(payload);
  const score = normalized.score_risco ? Number(normalized.score_risco) : calculateScoreFromFlags(normalized);

  return repository.create({
    ...normalized,
    score_risco: score,
    grau_risco_atual: classifyRisk(score),
    created_at: normalized.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

async function update(id, payload) {
  const normalized = normalizeBooleanFields(payload);
  const score = normalized.score_risco ? Number(normalized.score_risco) : calculateScoreFromFlags(normalized);

  return repository.update(id, {
    ...normalized,
    score_risco: score,
    grau_risco_atual: classifyRisk(score),
    updated_at: new Date().toISOString()
  });
}

async function remove(id) {
  return repository.remove(id);
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove
};
