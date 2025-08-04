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