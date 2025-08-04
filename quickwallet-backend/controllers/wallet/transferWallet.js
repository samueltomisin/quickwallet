const prisma = require('../prismaClient');

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