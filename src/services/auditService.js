const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const auditFilePath = path.resolve(__dirname, "../../data/audit-log.json");

async function ensureAuditFile() {
  try {
    await fs.access(auditFilePath);
  } catch {
    await fs.writeFile(auditFilePath, "[]\n", "utf-8");
  }
}

async function appendLog({ user, action, before = null, after = null }) {
  await ensureAuditFile();
  const raw = await fs.readFile(auditFilePath, "utf-8");
  const logs = JSON.parse(raw);

  logs.push({
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    user: {
      id: user?.sub,
      username: user?.username,
      role: user?.role
    },
    action,
    before,
    after
  });

  await fs.writeFile(auditFilePath, `${JSON.stringify(logs, null, 2)}\n`, "utf-8");
}

module.exports = {
  appendLog
};
