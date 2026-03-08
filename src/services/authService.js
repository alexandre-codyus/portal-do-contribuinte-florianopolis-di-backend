const jwt = require("jsonwebtoken");
const { USERS } = require("../config/users");

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET nao configurado no ambiente.");
  }
  return process.env.JWT_SECRET;
}

function login(username, password) {
  const user = USERS.find((item) => item.username === username && item.password === password);

  if (!user) {
    return null;
  }

  const payload = {
    sub: user.id,
    username: user.username,
    role: user.role,
    nome: user.nome
  };

  const token = jwt.sign(payload, getJwtSecret(), { expiresIn: "8h" });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      nome: user.nome
    }
  };
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  login,
  verifyToken
};
