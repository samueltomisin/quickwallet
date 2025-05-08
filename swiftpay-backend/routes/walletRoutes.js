const express = require("express");
const { getWallet, fundWallet } = require("../controllers/walletController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", authMiddleware, getWallet);
router.post("/fund", authMiddleware, fundWallet);

module.exports = router;
