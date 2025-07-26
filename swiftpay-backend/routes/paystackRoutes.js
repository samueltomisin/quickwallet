const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const paystackController = require('../controllers/paystackController');


router.post("/initialize", authMiddleware, paystackController.initializePayment);

module.exports = router;
