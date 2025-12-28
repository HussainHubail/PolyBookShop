// Script to add fake members for testing
import prisma from '../src/config/database';
import bcrypt from 'bcryptjs';

async function addFakeMembers() {
  console.log('🌱 Adding fake members...');

  const fakeMembers = [
    { loginId: 'MEM-ABC123', username: 'John Doe', email: 'john.doe@example.com' },
    { loginId: 'MEM-DEF456', username: 'Jane Smith', email: 'jane.smith@example.com' },
    { loginId: 'MEM-GHI789', username: 'Bob Johnson', email: 'bob.johnson@example.com' },
    { loginId: 'MEM-JKL012', username: 'Alice Brown', email: 'alice.brown@example.com' },
    { loginId: 'MEM-MNO345', username: 'Charlie Wilson', email: 'charlie.wilson@example.com' },
  ];

  const password = 'Member@123'; // Default password for all fake members
  const hashedPassword = await bcrypt.hash(password, 10);

  for (const member of fakeMembers) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { loginId: member.loginId },
      });

      if (existingUser) {
        console.log(`⏭️  User ${member.loginId} already exists, skipping...`);
        continue;
      }

      // Create user and member in a transaction
      const user = await prisma.user.create({
        data: {
          loginId: member.loginId,
          password: hashedPassword,
          username: member.username,
          email: member.email,
          accountType: 'MEMBER',
          emailVerified: true,
        },
      });

      await prisma.member.create({
        data: {
          userId: user.userId,
          joinDate: new Date(),
          status: 'active',
          maxBorrowedBooks: 5,
        },
      });

      console.log(`✅ Added member: ${member.username} (${member.loginId})`);
    } catch (error) {
      console.error(`❌ Failed to add ${member.username}:`, error);
    }
  }

  console.log('\n📊 Current Statistics:');
  const stats = {
    totalBooks: await prisma.book.count(),
    activeMembers: await prisma.member.count({
      where: { user: { emailVerified: true } },
    }),
    activeLoans: await prisma.loan.count({
      where: { status: { in: ['ongoing', 'overdue'] } },
    }),
    completedLoans: await prisma.loan.count({
      where: { status: 'returned' },
    }),
  };

  console.log(`📚 Total Books: ${stats.totalBooks}`);
  console.log(`👥 Active Members: ${stats.activeMembers}`);
  console.log(`📖 Active Loans: ${stats.activeLoans}`);
  console.log(`✅ Completed Loans: ${stats.completedLoans}`);

  console.log('\n🔑 Default password for all fake members: Member@123');
}

addFakeMembers()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
