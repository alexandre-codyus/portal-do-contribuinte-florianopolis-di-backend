const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

app.use(
  cors({
    origin: "*"
  })
);
app.use(express.json({ limit: "2mb" }));

app.use("/api", routes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Erro interno do servidor." });
});

module.exports = app;
