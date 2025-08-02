const prisma = require('../prismaClient');

const getTransactionsByUser = async (req, res) => {
  try {
    const { email } = req.params;
    
    // Simple validation
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    // Get transactions with Prisma
    const transactions = await prisma.transaction.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        createdAt: true
      }
    });

    res.json({ transactions });

  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({ error: "Failed to get transactions" });
  }
};

module.exports = { getTransactionsByUser };