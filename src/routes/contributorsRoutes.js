const express = require("express");
const contributorsController = require("../controllers/contributorsController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/authorizationMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", authorize("contributors", "read"), contributorsController.list);
router.get("/:id", authorize("contributors", "read"), contributorsController.getById);
router.post("/", authorize("contributors", "create"), contributorsController.create);
router.put("/:id", authorize("contributors", "update"), contributorsController.update);
router.delete("/:id", authorize("contributors", "delete"), contributorsController.remove);

module.exports = router;
