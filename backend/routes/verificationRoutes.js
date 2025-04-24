const express = require("express");
const { generateVerificationCode, verifyCode } = require("../middlewares/verificationMiddleware");

const router = express.Router();

router.post("/send-code", generateVerificationCode, (req, res) => {
  res.json({ success: true, message: "Verification code sent!" });
});

router.post("/verify-code", verifyCode, (req, res) => {
  res.json({ success: true, message: "Code verified!" });
});

module.exports = router;
