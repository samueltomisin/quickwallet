const Wallet = require("../models/Wallet");
const User = require('../models/User');
const recordTransaction = require('../utils/recordTransaction');
const mongoose = require('mongoose'); 

const getWallet = async (req, res) => {
  const { email } = req.body; // Changed from email to userId for consistency
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const wallet = await Wallet.findOne({ email }); // Changed to userId
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    
    res.status(200).json({ 
      balance: wallet.balance,
      currency: wallet.currency 
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createWallet = async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) { 
      return res.status(400).json({ message: "UserId and Email are required" });
    }

    const existingWallet = await Wallet.findOne({ $or: [{ userId }, { email }] });
    if (existingWallet) {
      return res.status(400).json({ message: "Wallet already exists for this user" });
    }

    const wallet = new Wallet({ 
      user: userId, // Fixed from newUser._id to userId
      email: email,   // Added email to wallet
      balance: 0, 
      currency: "NGN" 
    });
    
    await wallet.save();
    res.status(201).json({ 
      message: "Wallet created successfully", 
      wallet: wallet 
    });
  } catch (error) {
    console.error("Error Message:", error);
    res.status(500).json({ message: error.message });
  }
};

const fundWallet = async (req, res) => {
  try {
    const { email, amount, currency } = req.body;

    if (!email || !amount || !currency) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    const wallet = await Wallet.findOne({ email });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    
    wallet.balance += amount;
    await wallet.save();
    
    await recordTransaction({
      email: email,
      type: 'fundWallet',
      amount: amount,
      status: 'success'
    });

    res.status(200).json({ 
      message: "Wallet funded", 
      balance: wallet.balance 
    });
  } catch (error) {
    console.error("Funding error:", error);
    res.status(500).json({ message: "Funding failed" });
  }
};

const withdrawFunds = async (req, res) => {
  try {
    const { email, amount } = req.body;

    if (!email || !amount) {
      return res.status(400).json({ message: "Email and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    const wallet = await Wallet.findOne({ email });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    wallet.balance -= amount;
    await wallet.save();

    await recordTransaction({
      email: email,
      type: 'withdrawFunds',
      amount: amount,
      status: 'success'
    });

    res.status(200).json({
      message: "Withdrawal successful",
      newBalance: wallet.balance
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({ 
      message: "Withdrawal failed",
      error: error.message 
    });
  }
};

const transferFunds = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { fromUserId, toUserEmail, amount } = req.body;

    if (!fromUserId || !toUserEmail || !amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Transfer amount must be greater than zero" });
    }

    const senderWallet = await Wallet.findOne({ userId: fromUserId }).session(session);
    const receiverUser = await User.findOne({ email: toUserEmail }).session(session);
    
    if (!receiverUser) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Receiver not found" });
    }

    if (fromUserId === receiverUser._id.toString()) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Cannot transfer to self" });
    }

    const receiverWallet = await Wallet.findOne({ userId: receiverUser._id }).session(session);

    if (!senderWallet || !receiverWallet) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (senderWallet.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    // Record transactions for both parties
    await recordTransaction({
      userId: fromUserId,
      type: 'transfer_out',
      amount: amount,
      status: 'success'
    });
    
    await recordTransaction({
      userId: receiverUser._id,
      type: 'transfer_in',
      amount: amount,
      status: 'success'
    });

    await session.commitTransaction();
    res.status(200).json({ message: "Transfer successful" });

  } catch (err) {
    await session.abortTransaction();
    console.error("Transfer error:", err);
    res.status(500).json({ message: "Transfer failed", error: err.message });
  } finally {
    session.endSession();
  }
};

module.exports = { getWallet, createWallet, fundWallet, withdrawFunds, transferFunds };