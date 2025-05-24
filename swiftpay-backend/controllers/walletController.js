const Wallet = require("../models/Wallet");
const User = require('../models/User');
const recordTransaction = require('../utils/recordTransaction');


const getWallet =async (req, res) => {
  const { userId } = req.params;
  try {
    const wallet = await Wallet.findById(userId);
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    res.status(200).json({ balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


const createWallet = async (req, res) => {
  try {
const { userId, email } = req.body;

if ( !userId || !email ) { 
  return res.status(400).json({ message: "UserId and Email are required" });
}
 const existingWallet = await Wallet.findOne({ $or: [{ userId }, { email }] });
      if (existingWallet) {
          return res.status(400).json({ message: "Wallet already exists for this user" });
      }

      const newWallet = new Wallet({ userId, email, balance: 0 })
      await newWallet.save();

      res.status(201).json({ message: "Wallet created successfully", wallet: newWallet, });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

const fundWallet = async (req, res) => {

  try {
    const { userId } = req.body;
      const { amount, currency } = req.body;

    if (!userId || !amount || !currency) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    
    wallet.balance += amount;
    await wallet.save();
     await recordTransaction({
  userId: userId,
  type: 'fundWallet',
  amount: amount,
  status: 'success'
});

    res.status(200).json({ message: "Wallet funded", balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ message: "Funding failed" });
  }
 
};

const withdrawFunds = async (req, res) => {
  try {
    const { userId } = req.body; 
    const { amount } = req.body;
    console.log("Raw request body:", req.body);

    // 1. Validate input
    if (!userId || !amount) {
      return res.status(400).json({ message: "User ID and amount are required" });
    }

    // 2. Find wallet
    const wallet = await Wallet.findOne({ userId });
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

  await recordTransaction({
  userId: userId,
  type: 'withdrawFunds',
  amount: amount,
  status: 'success'
});

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

  const transferFunds = async (req, res) => {
  const { fromUserId, toUserEmail, amount } = req.body;

  try {
    if (!fromUserId || !toUserEmail || !amount) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Transfer amount must be greater than zero" });
    }

    const senderWallet = await Wallet.findOne({ userId: fromUserId });
    const receiverUser = await User.findOne({ email: toUserEmail });
    if (!receiverUser) return res.status(404).json({ message: "Receiver not found" });
if (fromUserId === receiverUser._id.toString()) {
  return res.status(400).json({ message: "Cannot transfer to self"});
}
    const receiverWallet = await Wallet.findOne({ userId: receiverUser._id });

    if (!senderWallet || !receiverWallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (senderWallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    await senderWallet.save();
    await receiverWallet.save();

    // Record transactions for both parties
    await recordTransaction(fromUserId, 'transfer_out', amount, 'success');
    await recordTransaction(receiverUser._id, 'transfer_in', amount, 'success');

    await sessionStorage.commitTransaction();
    res.status(200).json({ message: "Transfer successful" });

  } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

  const session = await mongoose.startSession();
    session.startTransaction();

};


module.exports = { getWallet, createWallet, fundWallet, withdrawFunds, transferFunds };

