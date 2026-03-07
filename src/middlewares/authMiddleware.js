const { verifyToken } = require("../services/authService");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token nao informado." });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: "Token invalido ou expirado." });
  }
}

module.exports = {
  authMiddleware
};
