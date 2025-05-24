const Transaction = require('../models/Transaction');

const getTransactionsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const transactions = await Transaction.find({ userId }).sort({ timestamp: -1 });
    res.status(200).json({ transactions });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch transactions", error: err.message });
  }
};

module.exports = { getTransactionsByUser };
