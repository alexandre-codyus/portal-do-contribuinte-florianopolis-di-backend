const express = require("express");
const authRoutes = require("./authRoutes");
const contributorsRoutes = require("./contributorsRoutes");
const platformRoutes = require("./platformRoutes");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "inteligencia-fiscal-api" });
});

router.use("/auth", authRoutes);
router.use("/contributors", contributorsRoutes);
router.use("/", platformRoutes);

module.exports = router;
