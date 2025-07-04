const express = require('express');
const router = express.Router();

const { generateTotp } = require("../../controllers/mfa\'s/totp\'s/generateTotp");
const { verifyTotp } = require("../../controllers/mfa\'s/totp\'s/verifyTotp");

router.post("/generate-totp", generateTotp);
router.post("/verify-totp", verifyTotp);

module.exports = router;

