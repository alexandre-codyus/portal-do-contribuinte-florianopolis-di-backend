const permissionsByRole = {
  ADMIN: {
    contributors: ["read", "create", "update", "delete"]
  },
  GESTOR: {
    contributors: ["read", "create", "update"]
  },
  AUDITOR: {
    contributors: ["read", "update"]
  },
  LEITOR: {
    contributors: ["read"]
  }
};

function can(role, resource, action) {
  const allowedActions = permissionsByRole[role]?.[resource] ?? [];
  return allowedActions.includes(action);
}

module.exports = {
  can
};
