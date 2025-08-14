const { PrismaClient } = require('@prisma/client');
const prisma =  new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL via Prisma');
  } catch (err) {
    console.error('❌ Error connecting to DB:', err.message);
    process.exit(1);
  }
};

connectDB();

module.exports = prisma;
