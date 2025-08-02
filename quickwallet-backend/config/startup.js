const prisma = require('./prismaClient');

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('🚀 Connected to PostgreSQL via Prisma');
  } catch (error) {
    console.error('❌ DB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
