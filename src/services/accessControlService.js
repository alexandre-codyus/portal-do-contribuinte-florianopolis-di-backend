const permissionsByRole = {
  ADMIN: {
    contributors: ["read", "create", "update", "delete"],
    analytics: ["read", "create"],
    fiscalizacao: ["read", "create", "update"],
    regularizacao: ["read", "create", "update"],
    processos: ["read", "create", "update"],
    ainf: ["read", "create", "update"],
    dte: ["read", "create", "ack"],
    portal: ["read", "create"],
    especializados: ["read", "create"]
  },
  GESTOR: {
    contributors: ["read", "create", "update"],
    analytics: ["read", "create"],
    fiscalizacao: ["read", "create", "update"],
    regularizacao: ["read", "create", "update"],
    processos: ["read", "create", "update"],
    ainf: ["read", "create", "update"],
    dte: ["read", "create", "ack"],
    portal: ["read", "create"],
    especializados: ["read", "create"]
  },
  AUDITOR: {
    contributors: ["read", "update"],
    analytics: ["read", "create"],
    fiscalizacao: ["read", "create", "update"],
    regularizacao: ["read", "create", "update"],
    processos: ["read", "create", "update"],
    ainf: ["read", "create", "update"],
    dte: ["read", "ack"],
    portal: ["read"],
    especializados: ["read", "create"]
  },
  LEITOR: {
    contributors: ["read"],
    analytics: ["read"],
    fiscalizacao: ["read"],
    regularizacao: ["read"],
    processos: ["read"],
    ainf: ["read"],
    dte: ["read"],
    portal: ["read"],
    especializados: ["read"]
  }
};

function can(role, resource, action) {
  const allowedActions = permissionsByRole[role]?.[resource] ?? [];
  return allowedActions.includes(action);
}

module.exports = {
  can
};
