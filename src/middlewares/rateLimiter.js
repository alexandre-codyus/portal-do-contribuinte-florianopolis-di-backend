const { AppError } = require("../errors/AppError");

const buckets = new Map();

function rateLimiter({ windowMs = 60_000, max = 120 } = {}) {
  return (req, _res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    const entry = buckets.get(key);
    if (!entry || now > entry.expiresAt) {
      buckets.set(key, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      return next(new AppError("Limite de requisicoes excedido para este endpoint.", 429));
    }

    return next();
  };
}

module.exports = {
  rateLimiter
};
