const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");

router.get("/requests", requestController.getAllPoliceRequests);
router.get("/requests/:policeId", requestController.getPoliceRequestByPoliceId);
router.put("/requests/approve/:policeId", requestController.approvePoliceRequest);
router.delete("/requests/reject/:policeId", requestController.rejectPoliceRequest);

module.exports = router;