const prisma = require('../prismaClient');

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
