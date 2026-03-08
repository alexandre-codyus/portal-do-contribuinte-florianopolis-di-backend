const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { swaggerUi, swaggerSpec } = require("./docs/swagger");
const { initDatabase } = require("./db");
const { requestLogger } = require("./middlewares/requestLogger");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();
initDatabase();

app.use(
  cors({
    origin: "*"
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(requestLogger);

app.get("/api/openapi.json", (_req, res) => {
  res.json(swaggerSpec);
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", routes);

app.use(errorHandler);

module.exports = app;
