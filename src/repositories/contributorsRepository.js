const { randomUUID } = require("node:crypto");
const { getDb } = require("../db");

function list() {
  const db = getDb();
  return db.prepare("SELECT * FROM contributors ORDER BY updated_at DESC").all();
}

function findById(id) {
  const db = getDb();
  return db.prepare("SELECT * FROM contributors WHERE id = ?").get(id) || null;
}

function create(payload) {
  const db = getDb();
  const contributor = {
    id: randomUUID(),
    ...payload
  };

  db.prepare(`
    INSERT INTO contributors (
      id, tipo, documento, natureza_juridica, regime_tributario, cnae_principal,
      optante_simples, historico_situacoes, grau_risco_atual, score_risco, volume_indice,
      inadimplente, cnae_incompativel, aliquota_divergente, oscilacao_suspeita, created_at, updated_at
    ) VALUES (
      @id, @tipo, @documento, @natureza_juridica, @regime_tributario, @cnae_principal,
      @optante_simples, @historico_situacoes, @grau_risco_atual, @score_risco, @volume_indice,
      @inadimplente, @cnae_incompativel, @aliquota_divergente, @oscilacao_suspeita, @created_at, @updated_at
    )
  `).run(contributor);

  return contributor;
}

function update(id, payload) {
  const db = getDb();
  const current = findById(id);
  if (!current) {
    return null;
  }

  const updated = {
    ...current,
    ...payload,
    id
  };

  db.prepare(`
    UPDATE contributors
    SET
      tipo = @tipo,
      documento = @documento,
      natureza_juridica = @natureza_juridica,
      regime_tributario = @regime_tributario,
      cnae_principal = @cnae_principal,
      optante_simples = @optante_simples,
      historico_situacoes = @historico_situacoes,
      grau_risco_atual = @grau_risco_atual,
      score_risco = @score_risco,
      volume_indice = @volume_indice,
      inadimplente = @inadimplente,
      cnae_incompativel = @cnae_incompativel,
      aliquota_divergente = @aliquota_divergente,
      oscilacao_suspeita = @oscilacao_suspeita,
      created_at = @created_at,
      updated_at = @updated_at
    WHERE id = @id
  `).run(updated);

  return updated;
}

function remove(id) {
  const db = getDb();
  const result = db.prepare("DELETE FROM contributors WHERE id = ?").run(id);
  return result.changes > 0;
}

module.exports = {
  list,
  findById,
  create,
  update,
  remove
};
