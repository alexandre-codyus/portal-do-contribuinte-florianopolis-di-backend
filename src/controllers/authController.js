const authService = require("../services/authService");

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "username e password sao obrigatorios." });
  }

  const result = authService.login(username, password);
  if (!result) {
    return res.status(401).json({ message: "Credenciais invalidas." });
  }

  return res.json(result);
}

module.exports = {
  login
};
