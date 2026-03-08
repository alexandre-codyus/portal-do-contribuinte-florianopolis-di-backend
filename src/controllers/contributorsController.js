const contributorsService = require("../services/contributorsService");
const auditService = require("../services/auditService");
const { validateCreatePayload, validatePagination } = require("../validators/contributorsValidator");

async function list(req, res) {
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 20);
  const q = req.query.q || "";
  validatePagination(page, pageSize);

  const result = await contributorsService.list({ page, pageSize, q });
  return res.json(result);
}

async function getById(req, res) {
  const contributor = await contributorsService.getById(req.params.id);
  if (!contributor) {
    return res.status(404).json({ message: "Contribuinte nao encontrado." });
  }
  return res.json(contributor);
}

async function create(req, res) {
  validateCreatePayload(req.body);
  const created = await contributorsService.create(req.body);
  await auditService.appendLog({
    user: req.user,
    action: "CREATE_CONTRIBUINTE",
    after: created
  });
  return res.status(201).json(created);
}

async function update(req, res) {
  validateCreatePayload(req.body);
  const before = await contributorsService.getById(req.params.id);
  if (!before) {
    return res.status(404).json({ message: "Contribuinte nao encontrado." });
  }

  const updated = await contributorsService.update(req.params.id, req.body);
  await auditService.appendLog({
    user: req.user,
    action: "UPDATE_CONTRIBUINTE",
    before,
    after: updated
  });

  return res.json(updated);
}

async function remove(req, res) {
  const before = await contributorsService.getById(req.params.id);
  if (!before) {
    return res.status(404).json({ message: "Contribuinte nao encontrado." });
  }

  const deleted = await contributorsService.remove(req.params.id);
  if (!deleted) {
    return res.status(500).json({ message: "Falha ao remover contribuinte." });
  }

  await auditService.appendLog({
    user: req.user,
    action: "DELETE_CONTRIBUINTE",
    before
  });

  return res.status(204).send();
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove
};
