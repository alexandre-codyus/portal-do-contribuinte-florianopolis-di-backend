const express = require("express");
const contributorsController = require("../controllers/contributorsController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/authorizationMiddleware");
const { asyncHandler } = require("../middlewares/asyncHandler");

const router = express.Router();

router.use(authMiddleware);

router.get("/", authorize("contributors", "read"), asyncHandler(contributorsController.list));
router.get("/:id", authorize("contributors", "read"), asyncHandler(contributorsController.getById));
router.post("/", authorize("contributors", "create"), asyncHandler(contributorsController.create));
router.put("/:id", authorize("contributors", "update"), asyncHandler(contributorsController.update));
router.delete("/:id", authorize("contributors", "delete"), asyncHandler(contributorsController.remove));

module.exports = router;
