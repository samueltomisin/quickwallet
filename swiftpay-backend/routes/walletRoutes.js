const express = require("express");
const { getWallet, createWallet, fundWallet, withdrawFunds } = require("../controllers/walletController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();



router.get("/:userId", authMiddleware, getWallet);
router.post("/fund", authMiddleware, fundWallet);
router.post("/create", authMiddleware, createWallet);
router.post("/withdraw", authMiddleware, withdrawFunds);

module.exports = router;
