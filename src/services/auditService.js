const { randomUUID } = require("node:crypto");
const { getDb } = require("../db");

async function appendLog({ user, action, before = null, after = null, requestMeta = null }) {
  const db = getDb();
  db.prepare(`
    INSERT INTO audit_logs (id, timestamp, user_id, username, role, action, request_id, route, method, before_json, after_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(),
    new Date().toISOString(),
    user?.sub || null,
    user?.username || null,
    user?.role || null,
    action,
    requestMeta?.requestId || null,
    requestMeta?.route || null,
    requestMeta?.method || null,
    before ? JSON.stringify(before) : null,
    after ? JSON.stringify(after) : null
  );
}

async function listLogs({ limit = 100 } = {}) {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?")
    .all(limit);

  return rows.map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    user: {
      id: row.user_id,
      username: row.username,
      role: row.role
    },
    action: row.action,
    requestMeta: {
      requestId: row.request_id,
      route: row.route,
      method: row.method
    },
    before: row.before_json ? JSON.parse(row.before_json) : null,
    after: row.after_json ? JSON.parse(row.after_json) : null
  }));
}

module.exports = {
  appendLog,
  listLogs
};
