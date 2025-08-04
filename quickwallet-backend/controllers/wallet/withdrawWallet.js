const prisma = require('../prismaClient');

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
