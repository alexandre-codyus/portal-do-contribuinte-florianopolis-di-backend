const express = require("express");
const platformController = require("../controllers/platformController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/authorizationMiddleware");
const { asyncHandler } = require("../middlewares/asyncHandler");

const router = express.Router();
router.use(authMiddleware);

router.post("/analytics/imports", authorize("analytics", "create"), asyncHandler(platformController.importAnalytics));
router.get("/analytics/indicators", authorize("analytics", "read"), asyncHandler(platformController.listIndicators));
router.get("/analytics/dashboard", authorize("analytics", "read"), asyncHandler(platformController.dashboard));
router.get("/analytics/priorities", authorize("analytics", "read"), asyncHandler(platformController.priorities));

router.post("/fiscalizacao/cases", authorize("fiscalizacao", "create"), asyncHandler(platformController.createFiscalCase));
router.post("/regularizacao/actions", authorize("regularizacao", "create"), asyncHandler(platformController.createRegularization));
router.get("/regularizacao/actions", authorize("regularizacao", "read"), asyncHandler(platformController.listRegularization));

router.post("/processos", authorize("processos", "create"), asyncHandler(platformController.createProcess));
router.get("/processos", authorize("processos", "read"), asyncHandler(platformController.listProcesses));
router.post("/processos/:processId/events", authorize("processos", "update"), asyncHandler(platformController.addProcessEvent));
router.get("/processos/:processId/events", authorize("processos", "read"), asyncHandler(platformController.listProcessEvents));
router.post("/comunicacoes", authorize("processos", "update"), asyncHandler(platformController.sendCommunication));

router.post("/ainf", authorize("ainf", "create"), asyncHandler(platformController.createAinf));
router.get("/ainf", authorize("ainf", "read"), asyncHandler(platformController.listAinf));

router.post("/dte/messages", authorize("dte", "create"), asyncHandler(platformController.sendDteMessage));
router.post("/dte/delegations", authorize("dte", "create"), asyncHandler(platformController.createDelegation));
router.post("/dte/messages/:messageId/ack", authorize("dte", "ack"), asyncHandler(platformController.acknowledgeDteMessage));
router.get("/dte/inbox/:contributorId", authorize("dte", "read"), asyncHandler(platformController.listDteInbox));

router.post("/portal/requests", authorize("portal", "create"), asyncHandler(platformController.openPortalRequest));
router.get("/portal/requests/:contributorId", authorize("portal", "read"), asyncHandler(platformController.listPortalRequests));

router.post("/especializados/:module/findings", authorize("especializados", "create"), asyncHandler(platformController.createSpecializedFinding));
router.get("/especializados/:module/findings", authorize("especializados", "read"), asyncHandler(platformController.listSpecializedFindings));

module.exports = router;
