const Wallet = require("../models/Wallet");

const getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.userId });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    res.status(200).json({ balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


const createWallet = async (req, res) => {
  try {
      const { userId } = req.body;

      const newWallet = new Wallet ({ user: userId })
      await newWallet.save();

      res.status(201).json({ message: "Wallet created successfully", wallet: newWallet, });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

const fundWallet = async (req, res) => {
  const { amount } = req.body;
  try {
    const { userId, amount, currency } = req.body;
    if (!userId || !amount || !currency) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    
    wallet.balance += amount;
    await wallet.save();

    res.status(200).json({ message: "Wallet funded", balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ message: "Funding failed" });
  }
};

const withdrawFunds = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    // 1. Validate input
    if (!userId || !amount) {
      return res.status(400).json({ message: "User ID and amount are required" });
    }

    // 2. Find wallet
    const wallet = await Wallet.findById(userId);
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // 3. Check sufficient balance
    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // 4. Process withdrawal
    wallet.balance -= amount;
    await wallet.save();

    res.status(200).json({
      message: "Withdrawal successful",
      newBalance: wallet.balance
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Withdrawal failed",
      error: error.message 
    });
  }
};

module.exports = { getWallet, createWallet, fundWallet, withdrawFunds };
