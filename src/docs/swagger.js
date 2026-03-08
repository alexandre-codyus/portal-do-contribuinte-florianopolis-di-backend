const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Inteligencia Fiscal API",
    version: "2.0.0",
    description: "Documentacao OpenAPI da plataforma de inteligencia fiscal."
  },
  servers: [
    {
      url: "/api",
      description: "Servidor local"
    }
  ],
  tags: [
    { name: "Health", description: "Monitoramento basico da API" },
    { name: "Auth", description: "Autenticacao e emissao de token JWT" },
    { name: "Contributors", description: "Gestao de contribuintes" },
    { name: "Analytics", description: "Ingestao, indicadores e visoes analiticas" },
    { name: "Fiscalizacao", description: "Gestao de fiscalizacoes e regularizacao" },
    { name: "Processos", description: "Processo fiscal eletronico e comunicacoes" },
    { name: "AINF", description: "Auto de infracao do Simples Nacional" },
    { name: "DTEPortal", description: "DTE e Portal do Contribuinte" },
    { name: "Especializados", description: "Modulos especializados do edital" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      HealthResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "ok" },
          service: { type: "string", example: "inteligencia-fiscal-api" }
        },
        required: ["status", "service"]
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Erro interno do servidor." }
        },
        required: ["message"]
      },
      LoginRequest: {
        type: "object",
        properties: {
          username: { type: "string", example: "admin" },
          password: { type: "string", example: "admin123" }
        },
        required: ["username", "password"]
      },
      UserSummary: {
        type: "object",
        properties: {
          id: { type: "string", example: "u-admin" },
          username: { type: "string", example: "admin" },
          role: { type: "string", example: "ADMIN" },
          nome: { type: "string", example: "Administrador" }
        },
        required: ["id", "username", "role", "nome"]
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string", example: "eyJhbGciOi..." },
          user: { $ref: "#/components/schemas/UserSummary" }
        },
        required: ["token", "user"]
      },
      Contributor: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "ee8258b1-e182-4658-a25e-8fcd32e7fce0" },
          tipo: { type: "string", example: "PJ" },
          documento: { type: "string", example: "10000000000001" },
          natureza_juridica: { type: "string", example: "Sociedade Empresaria Limitada" },
          regime_tributario: { type: "string", example: "Lucro Real" },
          cnae_principal: { type: "string", example: "8599604" },
          optante_simples: { type: "string", enum: ["true", "false"], example: "true" },
          historico_situacoes: {
            type: "string",
            example: "[{\"situacao\": \"ATIVO\", \"data\": \"2025-04-08\"}]"
          },
          grau_risco_atual: {
            type: "string",
            enum: ["Baixo", "Medio", "Alto", "Critico"],
            example: "Baixo"
          },
          score_risco: { type: "number", format: "float", example: 21.2 },
          volume_indice: { type: "number", format: "float", example: 50 },
          inadimplente: { type: "string", enum: ["true", "false"], example: "false" },
          cnae_incompativel: { type: "string", enum: ["true", "false"], example: "false" },
          aliquota_divergente: { type: "string", enum: ["true", "false"], example: "false" },
          oscilacao_suspeita: { type: "string", enum: ["true", "false"], example: "false" },
          created_at: { type: "string", format: "date-time", example: "2025-04-08T10:00:00.000Z" },
          updated_at: { type: "string", format: "date-time", example: "2025-05-05T10:00:00.000Z" }
        },
        required: [
          "id",
          "tipo",
          "documento",
          "natureza_juridica",
          "regime_tributario",
          "cnae_principal",
          "optante_simples",
          "historico_situacoes",
          "grau_risco_atual",
          "score_risco",
          "inadimplente",
          "cnae_incompativel",
          "aliquota_divergente",
          "oscilacao_suspeita",
          "created_at",
          "updated_at"
        ]
      },
      ContributorUpsertRequest: {
        type: "object",
        properties: {
          tipo: { type: "string", example: "PJ" },
          documento: { type: "string", example: "12345678000199" },
          natureza_juridica: { type: "string", example: "Sociedade Empresaria Limitada" },
          regime_tributario: { type: "string", example: "Lucro Presumido" },
          cnae_principal: { type: "string", example: "6201501" },
          optante_simples: {
            oneOf: [
              { type: "string", enum: ["true", "false"] },
              { type: "boolean" }
            ],
            example: false
          },
          historico_situacoes: {
            type: "string",
            example: "[{\"situacao\": \"ATIVO\", \"data\": \"2026-02-10\"}]"
          },
          score_risco: { type: "number", format: "float", example: 57.3 },
          volume_indice: { type: "number", format: "float", example: 70 },
          inadimplente: {
            oneOf: [
              { type: "string", enum: ["true", "false"] },
              { type: "boolean" }
            ],
            example: true
          },
          cnae_incompativel: {
            oneOf: [
              { type: "string", enum: ["true", "false"] },
              { type: "boolean" }
            ],
            example: false
          },
          aliquota_divergente: {
            oneOf: [
              { type: "string", enum: ["true", "false"] },
              { type: "boolean" }
            ],
            example: false
          },
          oscilacao_suspeita: {
            oneOf: [
              { type: "string", enum: ["true", "false"] },
              { type: "boolean" }
            ],
            example: false
          },
          created_at: { type: "string", format: "date-time" }
        }
      },
      ContributorsListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Contributor" }
          },
          total: { type: "integer", example: 2500 },
          page: { type: "integer", example: 1 },
          pageSize: { type: "integer", example: 20 }
        },
        required: ["data", "total", "page", "pageSize"]
      }
    }
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Verifica se a API esta ativa",
        responses: {
          200: {
            description: "API em funcionamento",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" }
              }
            }
          }
        }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Autentica usuario e retorna JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Login realizado com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" }
              }
            }
          },
          400: {
            description: "Campos obrigatorios ausentes",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          401: {
            description: "Credenciais invalidas",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/contributors": {
      get: {
        tags: ["Contributors"],
        summary: "Lista contribuintes com paginacao e filtro",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Pagina atual"
          },
          {
            name: "pageSize",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 20 },
            description: "Quantidade de itens por pagina"
          },
          {
            name: "q",
            in: "query",
            schema: { type: "string" },
            description: "Busca por documento, tipo, regime tributario ou grau de risco"
          }
        ],
        responses: {
          200: {
            description: "Lista retornada com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ContributorsListResponse" }
              }
            }
          },
          401: {
            description: "Token ausente, invalido ou expirado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          403: {
            description: "Usuario sem permissao",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      post: {
        tags: ["Contributors"],
        summary: "Cria um novo contribuinte",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ContributorUpsertRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Contribuinte criado com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Contributor" }
              }
            }
          },
          401: {
            description: "Token ausente, invalido ou expirado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          403: {
            description: "Usuario sem permissao",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/contributors/{id}": {
      get: {
        tags: ["Contributors"],
        summary: "Busca contribuinte por id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" }
          }
        ],
        responses: {
          200: {
            description: "Contribuinte encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Contributor" }
              }
            }
          },
          401: {
            description: "Token ausente, invalido ou expirado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          403: {
            description: "Usuario sem permissao",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          404: {
            description: "Contribuinte nao encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      put: {
        tags: ["Contributors"],
        summary: "Atualiza um contribuinte existente",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ContributorUpsertRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Contribuinte atualizado com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Contributor" }
              }
            }
          },
          401: {
            description: "Token ausente, invalido ou expirado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          403: {
            description: "Usuario sem permissao",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          404: {
            description: "Contribuinte nao encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      delete: {
        tags: ["Contributors"],
        summary: "Remove contribuinte por id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" }
          }
        ],
        responses: {
          204: {
            description: "Contribuinte removido com sucesso"
          },
          401: {
            description: "Token ausente, invalido ou expirado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          403: {
            description: "Usuario sem permissao",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          404: {
            description: "Contribuinte nao encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          },
          500: {
            description: "Falha ao remover contribuinte",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/analytics/imports": {
      post: {
        tags: ["Analytics"],
        summary: "Executa ingestao analitica e gera indicadores",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Importacao concluida" }
        }
      }
    },
    "/analytics/indicators": {
      get: {
        tags: ["Analytics"],
        summary: "Lista indicadores de risco gerados",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Indicadores retornados" }
        }
      }
    },
    "/analytics/dashboard": {
      get: {
        tags: ["Analytics"],
        summary: "Retorna visao consolidada de risco",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Dashboard retornado" }
        }
      }
    },
    "/fiscalizacao/cases": {
      post: {
        tags: ["Fiscalizacao"],
        summary: "Abre caso de fiscalizacao",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                contributorId: "uuid-do-contribuinte",
                regimeType: "SIMPLES_NACIONAL",
                priority: 85,
                notes: "Iniciado por regra de risco"
              }
            }
          }
        },
        responses: {
          201: { description: "Caso criado" }
        }
      }
    },
    "/fiscalizacao/cases/{caseId}/status": {
      patch: {
        tags: ["Fiscalizacao"],
        summary: "Atualiza status do caso de fiscalizacao",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "caseId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { status: "EM_ANALISE" }
            }
          }
        },
        responses: {
          200: { description: "Status atualizado" },
          409: { description: "Transicao de status invalida" },
          429: { description: "Rate limit excedido" }
        }
      }
    },
    "/regularizacao/actions": {
      get: {
        tags: ["Fiscalizacao"],
        summary: "Lista acoes de regularizacao orientada",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Acoes listadas" }
        }
      },
      post: {
        tags: ["Fiscalizacao"],
        summary: "Registra acao de regularizacao orientada",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Acao registrada" }
        }
      }
    },
    "/regularizacao/actions/{actionId}/status": {
      patch: {
        tags: ["Fiscalizacao"],
        summary: "Atualiza status da acao de regularizacao",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "actionId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { status: "CONCLUIDA", resultNotes: "Contribuinte regularizou pendencias" }
            }
          }
        },
        responses: {
          200: { description: "Status atualizado" },
          409: { description: "Transicao de status invalida" },
          429: { description: "Rate limit excedido" }
        }
      }
    },
    "/processos": {
      get: {
        tags: ["Processos"],
        summary: "Lista processos fiscais eletronicos",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Processos listados" }
        }
      },
      post: {
        tags: ["Processos"],
        summary: "Cria processo fiscal eletronico",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Processo criado" }
        }
      }
    },
    "/processos/{processId}/status": {
      patch: {
        tags: ["Processos"],
        summary: "Atualiza status do processo fiscal",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "processId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { status: "AGUARDANDO_CIENCIA" }
            }
          }
        },
        responses: {
          200: { description: "Status atualizado" },
          409: { description: "Transicao de status invalida" },
          429: { description: "Rate limit excedido" }
        }
      }
    },
    "/comunicacoes/{processId}": {
      get: {
        tags: ["Processos"],
        summary: "Lista comunicacoes vinculadas ao processo",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "processId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: { description: "Comunicacoes listadas" }
        }
      }
    },
    "/ainf": {
      get: {
        tags: ["AINF"],
        summary: "Lista autos de infracao",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "AINFs listados" }
        }
      },
      post: {
        tags: ["AINF"],
        summary: "Lavra auto de infracao do Simples",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "AINF criado" }
        }
      }
    },
    "/ainf/{ainfId}/status": {
      patch: {
        tags: ["AINF"],
        summary: "Atualiza status do AINF",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "ainfId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { status: "NOTIFICADO" }
            }
          }
        },
        responses: {
          200: { description: "Status atualizado" },
          409: { description: "Transicao de status invalida" },
          429: { description: "Rate limit excedido" }
        }
      }
    },
    "/dte/messages": {
      post: {
        tags: ["DTEPortal"],
        summary: "Publica comunicacao no DTE",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Mensagem DTE enviada" }
        }
      }
    },
    "/portal/requests": {
      post: {
        tags: ["DTEPortal"],
        summary: "Abre solicitacao no portal do contribuinte",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Solicitacao criada" }
        }
      }
    },
    "/especializados/{module}/findings": {
      get: {
        tags: ["Especializados"],
        summary: "Lista achados de modulo especializado",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "module",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: { description: "Achados listados" }
        }
      },
      post: {
        tags: ["Especializados"],
        summary: "Registra achado em modulo especializado",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "module",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          201: { description: "Achado registrado" }
        }
      }
    }
  }
};

const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: []
});

module.exports = {
  swaggerUi,
  swaggerSpec
};
