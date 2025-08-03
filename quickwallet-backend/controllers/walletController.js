const prisma = require('../prismaClient');

const getWallet = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const wallet = await prisma.wallet.findFirst({
      where: {
        user: { 
          email: email, },
      },
      select: {
        balance: true,
        currency: true
      }
    });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.status(200).json(wallet);

  } catch (error) {
    console.error("Get wallet error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createWallet = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if wallet already exists
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId: user.id }
    });

    if (existingWallet) {
      return res.status(400).json({ message: "Wallet already exists for this user" });
    }

    // Create wallet
    const wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
        currency: "NGN"
      }
    });

    res.status(201).json({
      message: "Wallet created successfully",
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
        currency: wallet.currency,
      },
    });

  } catch (error) {
    console.error("Create wallet error:", error);
    res.status(500).json({ message: error.message });
  }
};

const fundWallet = async (req, res) => {
  const { email, amount } = req.body;

  try {
    if (!email || amount === undefined) {
      return res.status(400).json({ message: "Email and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid Amount" });
    }

    const result = await prisma.$transaction(async (tx) => {
      
      // Get user and wallet
      const user = await tx.user.findUnique({
        where: { email },
        
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Update wallet balance
      const wallet = await prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { increment: amount } }
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount,
          type: 'fund',
          status: 'success',
          reference: `fund-${Date.now()}`
        }
      });

      return wallet;
    });

    res.status(200).json({
      message: "Wallet funded successfully",
      balance: result.balance
    });

  } catch (error) {
    console.error("Fund wallet error:", error);
    res.status(500).json({ 
      message: error.message || "Funding failed" 
    });
  }
};

const withdrawFunds = async (req, res) => {
  const { email, amount } = req.body;

  try {
    if (!email || amount === undefined) {
      return res.status(400).json({ message: "Email and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    const result = await prisma.$transaction(async (prisma) => {
      // Get user and wallet
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      });

      if (!user) {
        throw new Error("User not found");
      }

      const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id }
      });

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      if (wallet.balance < amount) {
        throw new Error("Insufficient funds");
      }

      // Update wallet balance
      const updatedWallet = await prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: amount } }
      });

      // Record transaction
      await prisma.transaction.create({
        data: {
          userId: user.id,
          amount,
          type: 'withdrawal',
          status: 'success',
          reference: `withdraw-${Date.now()}`
        }
      });

      return updatedWallet;
    });

    res.status(200).json({
      message: "Withdrawal successful",
      newBalance: result.balance
    });

  } catch (error) {
    console.error("Withdrawal error:", error);
    const status = error.message === "User not found" || error.message === "Wallet not found" 
      ? 404 
      : error.message === "Insufficient funds" 
      ? 400 
      : 500;
    
    res.status(status).json({ 
      message: error.message || "Withdrawal failed" 
    });
  }
};

const transferFunds = async (req, res) => {
  const { fromEmail, toEmail, amount } = req.body;

  try {
    if (!fromEmail || !toEmail || amount === undefined) {
      return res.status(400).json({ message: "From email, to email and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    if (fromEmail === toEmail) {
      return res.status(400).json({ message: "Cannot transfer to yourself" });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get sender and receiver
      const sender = await tx.user.findUnique({
        where: { email: fromEmail },
        select: { id: true }
      });

      const receiver = await tx.user.findUnique({
        where: { email: toEmail },
    
      });

      if (!sender || !receiver) {
        throw new Error(sender ? "Receiver not found" : "Sender not found");
      }

      // Get wallets
      const senderWallet = await tx.wallet.findUnique({
        where: { userId: sender.id }
      });

      const receiverWallet = await tx.wallet.findUnique({
        where: { userId: receiver.id }
      });

      if (!senderWallet || !receiverWallet) {
        throw new Error(senderWallet ? "Receiver wallet not found" : "Sender wallet not found");
      }

      if (senderWallet.balance < amount) {
        throw new Error("Insufficient balance");
      }

      // Update balances
      await tx.wallet.update({
        where: { userId: sender.id },
        data: { balance: { decrement: amount } }
      });

      await tx.wallet.update({
        where: { userId: receiver.id },
        data: { balance: { increment: amount } }
      });

      // Record transactions
      await tx.transaction.createMany({
        data: [
          {
            userId: sender.id,
            amount,
            type: 'transfer_out',
            status: 'success',
            reference: `transfer-out-${Date.now()}`
          },
          {
            userId: receiver.id,
            amount,
            type: 'transfer_in',
            status: 'success',
            reference: `transfer-in-${Date.now()}`
          }
        ]
      });

      return { senderId: sender.id, receiverId: receiver.id };
    });

    res.status(200).json({
      message: "Transfer successful",
      transferId: `${result.senderId}-to-${result.receiverId}`
    });

  } catch (error) {
    console.error("Transfer error:", error);
    const status = error.message.includes("not found") 
      ? 404 
      : error.message === "Insufficient balance" 
      ? 400 
      : 500;
    
    res.status(status).json({ 
      message: error.message || "Transfer failed" 
    });
  }
};

module.exports = {
  getWallet,
  createWallet,
  fundWallet,
  withdrawFunds,
  transferFunds
};