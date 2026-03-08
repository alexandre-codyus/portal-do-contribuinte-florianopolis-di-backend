const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const dbDir = path.resolve(__dirname, "../../data");
const dbFilePath = path.join(dbDir, "ifiscal.sqlite");

let db;

function ensureDbDir() {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

function tableIsEmpty(database, tableName) {
  const row = database.prepare(`SELECT COUNT(*) AS total FROM ${tableName}`).get();
  return row.total === 0;
}

function loadJsonFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  if (!raw.trim()) return [];
  return JSON.parse(raw);
}

function migrateSchema(database) {
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS contributors (
      id TEXT PRIMARY KEY,
      tipo TEXT NOT NULL,
      documento TEXT NOT NULL,
      natureza_juridica TEXT NOT NULL,
      regime_tributario TEXT NOT NULL,
      cnae_principal TEXT NOT NULL,
      optante_simples TEXT NOT NULL,
      historico_situacoes TEXT NOT NULL,
      grau_risco_atual TEXT NOT NULL,
      score_risco REAL NOT NULL,
      volume_indice REAL DEFAULT 50,
      inadimplente TEXT NOT NULL,
      cnae_incompativel TEXT NOT NULL,
      aliquota_divergente TEXT NOT NULL,
      oscilacao_suspeita TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      user_id TEXT,
      username TEXT,
      role TEXT,
      action TEXT NOT NULL,
      request_id TEXT,
      route TEXT,
      method TEXT,
      before_json TEXT,
      after_json TEXT
    );

    CREATE TABLE IF NOT EXISTS analytics_imports (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      status TEXT NOT NULL,
      rows_imported INTEGER NOT NULL DEFAULT 0,
      metadata_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS risk_indicators (
      id TEXT PRIMARY KEY,
      contributor_id TEXT NOT NULL,
      rule_code TEXT NOT NULL,
      severity TEXT NOT NULL,
      score REAL NOT NULL,
      details_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS fiscal_cases (
      id TEXT PRIMARY KEY,
      contributor_id TEXT NOT NULL,
      regime_type TEXT NOT NULL,
      status TEXT NOT NULL,
      priority INTEGER NOT NULL DEFAULT 0,
      origin_indicator_id TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS regularization_actions (
      id TEXT PRIMARY KEY,
      fiscal_case_id TEXT,
      contributor_id TEXT NOT NULL,
      status TEXT NOT NULL,
      guidance TEXT NOT NULL,
      result_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (fiscal_case_id) REFERENCES fiscal_cases(id) ON DELETE SET NULL,
      FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS fiscal_processes (
      id TEXT PRIMARY KEY,
      fiscal_case_id TEXT,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      current_stage TEXT NOT NULL,
      due_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (fiscal_case_id) REFERENCES fiscal_cases(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS process_events (
      id TEXT PRIMARY KEY,
      process_id TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      actor_username TEXT,
      payload_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (process_id) REFERENCES fiscal_processes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS communications (
      id TEXT PRIMARY KEY,
      process_id TEXT,
      contributor_id TEXT,
      channel TEXT NOT NULL,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      read_at TEXT,
      FOREIGN KEY (process_id) REFERENCES fiscal_processes(id) ON DELETE SET NULL,
      FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS ainf_records (
      id TEXT PRIMARY KEY,
      process_id TEXT,
      fiscal_case_id TEXT,
      contributor_id TEXT NOT NULL,
      period_ref TEXT NOT NULL,
      tax_amount REAL NOT NULL,
      penalty_amount REAL NOT NULL,
      total_amount REAL NOT NULL,
      legal_basis TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (process_id) REFERENCES fiscal_processes(id) ON DELETE SET NULL,
      FOREIGN KEY (fiscal_case_id) REFERENCES fiscal_cases(id) ON DELETE SET NULL,
      FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS delegations (
      id TEXT PRIMARY KEY,
      contributor_document TEXT NOT NULL,
      representative_document TEXT NOT NULL,
      permissions_json TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dte_messages (
      id TEXT PRIMARY KEY,
      contributor_id TEXT NOT NULL,
      process_id TEXT,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      science_at TEXT,
      FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE CASCADE,
      FOREIGN KEY (process_id) REFERENCES fiscal_processes(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS portal_requests (
      id TEXT PRIMARY KEY,
      contributor_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      attachments_json TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS specialized_findings (
      id TEXT PRIMARY KEY,
      module TEXT NOT NULL,
      contributor_id TEXT,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL,
      evidence_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE SET NULL
    );
  `);

  // Backward-compatible columns when database already exists.
  const ensureColumn = (table, column, type) => {
    const rows = database.prepare(`PRAGMA table_info(${table})`).all();
    const exists = rows.some((row) => row.name === column);
    if (!exists) {
      database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    }
  };

  ensureColumn("audit_logs", "request_id", "TEXT");
  ensureColumn("audit_logs", "route", "TEXT");
  ensureColumn("audit_logs", "method", "TEXT");
}

function seedFromLegacyFiles(database) {
  const contributorsFilePath = path.resolve(__dirname, "../../data/contribuintes.json");
  const auditFilePath = path.resolve(__dirname, "../../data/audit-log.json");

  if (tableIsEmpty(database, "contributors")) {
    const contributors = loadJsonFile(contributorsFilePath);
    const stmt = database.prepare(`
      INSERT INTO contributors (
        id, tipo, documento, natureza_juridica, regime_tributario, cnae_principal,
        optante_simples, historico_situacoes, grau_risco_atual, score_risco, volume_indice,
        inadimplente, cnae_incompativel, aliquota_divergente, oscilacao_suspeita, created_at, updated_at
      ) VALUES (
        @id, @tipo, @documento, @natureza_juridica, @regime_tributario, @cnae_principal,
        @optante_simples, @historico_situacoes, @grau_risco_atual, @score_risco, @volume_indice,
        @inadimplente, @cnae_incompativel, @aliquota_divergente, @oscilacao_suspeita, @created_at, @updated_at
      )
    `);

    const insertMany = database.transaction((rows) => {
      for (const row of rows) {
        stmt.run({
          id: row.id,
          tipo: row.tipo,
          documento: row.documento,
          natureza_juridica: row.natureza_juridica,
          regime_tributario: row.regime_tributario,
          cnae_principal: row.cnae_principal,
          optante_simples: row.optante_simples,
          historico_situacoes: row.historico_situacoes,
          grau_risco_atual: row.grau_risco_atual,
          score_risco: Number(row.score_risco || 0),
          volume_indice: Number(row.volume_indice || 50),
          inadimplente: row.inadimplente || "false",
          cnae_incompativel: row.cnae_incompativel || "false",
          aliquota_divergente: row.aliquota_divergente || "false",
          oscilacao_suspeita: row.oscilacao_suspeita || "false",
          created_at: row.created_at || new Date().toISOString(),
          updated_at: row.updated_at || new Date().toISOString()
        });
      }
    });

    insertMany(contributors);
  }

  if (tableIsEmpty(database, "audit_logs")) {
    const logs = loadJsonFile(auditFilePath);
    const stmt = database.prepare(`
      INSERT INTO audit_logs (id, timestamp, user_id, username, role, action, request_id, route, method, before_json, after_json)
      VALUES (@id, @timestamp, @user_id, @username, @role, @action, @request_id, @route, @method, @before_json, @after_json)
    `);

    const insertMany = database.transaction((rows) => {
      for (const row of rows) {
        stmt.run({
          id: row.id,
          timestamp: row.timestamp || new Date().toISOString(),
          user_id: row.user?.id || null,
          username: row.user?.username || null,
          role: row.user?.role || null,
          action: row.action || "UNKNOWN",
          request_id: row.requestId || null,
          route: row.route || null,
          method: row.method || null,
          before_json: row.before ? JSON.stringify(row.before) : null,
          after_json: row.after ? JSON.stringify(row.after) : null
        });
      }
    });

    insertMany(logs);
  }
}

function initDatabase() {
  if (db) return db;

  ensureDbDir();
  db = new Database(dbFilePath);
  migrateSchema(db);
  seedFromLegacyFiles(db);
  return db;
}

function getDb() {
  if (!db) {
    return initDatabase();
  }
  return db;
}

module.exports = {
  initDatabase,
  getDb
};
