const express = require("express");
const platformController = require("../controllers/platformController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/authorizationMiddleware");
const { asyncHandler } = require("../middlewares/asyncHandler");
const { rateLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();
router.use(authMiddleware);
const writeLimiter = rateLimiter({ windowMs: 60_000, max: 80 });

router.post("/analytics/imports", writeLimiter, authorize("analytics", "create"), asyncHandler(platformController.importAnalytics));
router.get("/analytics/indicators", authorize("analytics", "read"), asyncHandler(platformController.listIndicators));
router.get("/analytics/dashboard", authorize("analytics", "read"), asyncHandler(platformController.dashboard));
router.get("/analytics/priorities", authorize("analytics", "read"), asyncHandler(platformController.priorities));

router.post("/fiscalizacao/cases", writeLimiter, authorize("fiscalizacao", "create"), asyncHandler(platformController.createFiscalCase));
router.patch("/fiscalizacao/cases/:caseId/status", writeLimiter, authorize("fiscalizacao", "update"), asyncHandler(platformController.updateFiscalCaseStatus));
router.post("/regularizacao/actions", writeLimiter, authorize("regularizacao", "create"), asyncHandler(platformController.createRegularization));
router.patch("/regularizacao/actions/:actionId/status", writeLimiter, authorize("regularizacao", "update"), asyncHandler(platformController.updateRegularizationStatus));
router.get("/regularizacao/actions", authorize("regularizacao", "read"), asyncHandler(platformController.listRegularization));

router.post("/processos", writeLimiter, authorize("processos", "create"), asyncHandler(platformController.createProcess));
router.patch("/processos/:processId/status", writeLimiter, authorize("processos", "update"), asyncHandler(platformController.updateProcessStatus));
router.get("/processos", authorize("processos", "read"), asyncHandler(platformController.listProcesses));
router.post("/processos/:processId/events", writeLimiter, authorize("processos", "update"), asyncHandler(platformController.addProcessEvent));
router.get("/processos/:processId/events", authorize("processos", "read"), asyncHandler(platformController.listProcessEvents));
router.post("/comunicacoes", writeLimiter, authorize("processos", "update"), asyncHandler(platformController.sendCommunication));
router.get("/comunicacoes/:processId", authorize("processos", "read"), asyncHandler(platformController.listProcessCommunications));

router.post("/ainf", writeLimiter, authorize("ainf", "create"), asyncHandler(platformController.createAinf));
router.patch("/ainf/:ainfId/status", writeLimiter, authorize("ainf", "update"), asyncHandler(platformController.updateAinfStatus));
router.get("/ainf", authorize("ainf", "read"), asyncHandler(platformController.listAinf));

router.post("/dte/messages", writeLimiter, authorize("dte", "create"), asyncHandler(platformController.sendDteMessage));
router.post("/dte/delegations", writeLimiter, authorize("dte", "create"), asyncHandler(platformController.createDelegation));
router.post("/dte/messages/:messageId/ack", writeLimiter, authorize("dte", "ack"), asyncHandler(platformController.acknowledgeDteMessage));
router.get("/dte/inbox/:contributorId", authorize("dte", "read"), asyncHandler(platformController.listDteInbox));

router.post("/portal/requests", writeLimiter, authorize("portal", "create"), asyncHandler(platformController.openPortalRequest));
router.get("/portal/requests/:contributorId", authorize("portal", "read"), asyncHandler(platformController.listPortalRequests));

router.post("/especializados/:module/findings", writeLimiter, authorize("especializados", "create"), asyncHandler(platformController.createSpecializedFinding));
router.get("/especializados/:module/findings", authorize("especializados", "read"), asyncHandler(platformController.listSpecializedFindings));

module.exports = router;
