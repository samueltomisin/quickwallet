const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

const recordTransaction = async ({ email, type, amount, status = 'success' }) => {
  try {
    const reference = uuidv4(); // Generate unique transaction ID
    const transaction = new Transaction({ email, type, amount, status, reference });
    await transaction.save();
  } catch (err) {
    console.error("Transaction Logging Failed:", err);
  }
};

module.exports = recordTransaction;
