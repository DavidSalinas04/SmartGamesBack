const express = require('express');
const router = express.Router();

const { deactivate } = require("../../controllers/mfa's/deactivate")

router.post("/deactivate", deactivate);

module.exports = router;