const { AppError } = require("../errors/AppError");

function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      requestId: req.requestId,
      details: err.details || undefined
    });
  }

  console.error(err);
  return res.status(500).json({
    message: "Erro interno do servidor.",
    requestId: req.requestId
  });
}

module.exports = {
  errorHandler
};
