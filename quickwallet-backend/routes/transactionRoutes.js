const express = require('express');
const router = express.Router();
const { getTransactionsByUser } = require('../controllers/transactionController');

router.get('/:userId', getTransactionsByUser);

module.exports = router;
