const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function main() {
  // First, delete old data (optional if running multiple times)
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  // Create two users
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      username: 'alice',
      password: 'hashedpassword1',
      wallet: {
        create: {
          balance: 10000
        }
      }
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      username: 'bob',
      password: 'hashedpassword2',
      wallet: {
        create: {
          balance: 5000
        }
      }
    }
  });

  // Create a transaction between them
  await prisma.transaction.create({
    data: {
      amount: 2000,
      senderId: user1.id,
      receiverId: user2.id,
    }
  });

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
