const Wallet = require("../models/Wallet");

const getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.userId });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const fundWallet = async (req, res) => {
  const { amount } = req.body;
  try {
    const wallet = await Wallet.findOne({ user: req.userId });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    wallet.balance += amount;
    await wallet.save();
    res.status(200).json({ message: "Wallet funded", balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ message: "Funding failed" });
  }
};

module.exports = { getWallet, fundWallet };
