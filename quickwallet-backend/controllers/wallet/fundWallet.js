const prisma = require('../prismaClient');

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