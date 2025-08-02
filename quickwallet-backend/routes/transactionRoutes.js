const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const transactionController = require('../controllers/transactionController');

router.get('/:email', authMiddleware, transactionController.getTransactionsByUser);

module.exports = router;
