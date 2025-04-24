const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");

router.get("/", requestController.getAllPoliceRequests);
router.get("/:policeId", requestController.getPoliceRequestByPoliceId);
router.put("/approve/:policeId", requestController.approvePoliceRequest);
router.delete("/reject/:policeId", requestController.rejectPoliceRequest);

module.exports = router;
