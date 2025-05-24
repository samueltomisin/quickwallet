const express = require("express");
const { getWallet, createWallet, fundWallet, withdrawFunds, transferFunds } = require("../controllers/walletController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();



router.get("/:userId", authMiddleware, getWallet);
router.post("/fund", authMiddleware, fundWallet);
router.post("/create", authMiddleware, createWallet);
router.post("/withdraw", authMiddleware, withdrawFunds);
router.post("/transfer", authMiddleware, transferFunds);

module.exports = router;
