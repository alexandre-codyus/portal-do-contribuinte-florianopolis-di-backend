const { can } = require("../services/accessControlService");

function authorize(resource, action) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) {
      return res.status(403).json({ message: "Perfil do usuario nao encontrado." });
    }

    const isAllowed = can(role, resource, action);
    if (!isAllowed) {
      return res.status(403).json({ message: "Acesso negado para esta operacao." });
    }

    return next();
  };
}

module.exports = {
  authorize
};
