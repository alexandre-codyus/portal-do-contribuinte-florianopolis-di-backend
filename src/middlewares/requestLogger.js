const { randomUUID } = require("node:crypto");

function requestLogger(req, res, next) {
  const requestId = randomUUID();
  const startedAt = Date.now();
  req.requestId = requestId;

  res.setHeader("x-request-id", requestId);
  res.on("finish", () => {
    const elapsedMs = Date.now() - startedAt;
    const payload = {
      level: "info",
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      elapsedMs
    };
    console.log(JSON.stringify(payload));
  });

  next();
}

module.exports = {
  requestLogger
};
