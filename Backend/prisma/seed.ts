// FILE: prisma/seed.ts
// Database seeding script - creates initial roles and admin account

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create roles
  console.log('Creating roles...');
  
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'System administrator with full access to all features',
    },
  });

  const librarianRole = await prisma.role.upsert({
    where: { name: 'LIBRARIAN' },
    update: {},
    create: {
      name: 'LIBRARIAN',
      description: 'Librarian with access to manage books, loans, and members',
    },
  });

  await prisma.role.upsert({
    where: { name: 'MEMBER' },
    update: {},
    create: {
      name: 'MEMBER',
      description: 'Library member who can borrow books and make reservations',
    },
  });

  console.log('✅ Roles created');

  // Create default admin account
  console.log('Creating default admin account...');
  
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  const adminUser = await prisma.user.upsert({
    where: { loginId: 'ADM-ADMIN1' },
    update: {},
    create: {
      username: 'Administrator',
      email: 'admin@polybookshop.com',
      passwordHash,
      loginId: 'ADM-ADMIN1',
      accountType: 'ADMIN',
      emailVerified: true,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Default admin created');
  console.log('\n📝 Default Admin Credentials:');
  console.log('   Login ID: ADM-ADMIN1');
  console.log('   Password: Admin@123');
  console.log('   ⚠️  IMPORTANT: Change this password after first login!\n');

  // Create sample librarian account
  console.log('Creating default librarian account...');
  
  const librarianPasswordHash = await bcrypt.hash('Librarian@123', 10);

  const librarianUser = await prisma.user.upsert({
    where: { loginId: 'LIB-LIB001' },
    update: {},
    create: {
      username: 'Head Librarian',
      email: 'librarian@polybookshop.com',
      passwordHash: librarianPasswordHash,
      loginId: 'LIB-LIB001',
      accountType: 'LIBRARIAN',
      emailVerified: true,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: librarianUser.id,
        roleId: librarianRole.id,
      },
    },
    update: {},
    create: {
      userId: librarianUser.id,
      roleId: librarianRole.id,
    },
  });

  console.log('✅ Default librarian created');
  console.log('\n📝 Default Librarian Credentials:');
  console.log('   Login ID: LIB-LIB001');
  console.log('   Password: Librarian@123');
  console.log('   ⚠️  IMPORTANT: Change this password after first login!\n');

  // Create dummy books
  console.log('Creating dummy books...');

  const books = [
    {
      isbn: '978-0-7475-3269-9',
      title: 'Harry Potter and the Philosopher\'s Stone',
      author: 'J.K. Rowling',
      publisher: 'Bloomsbury',
      publishedYear: 1997,
      category: 'Fantasy',
      description: 'The first novel in the Harry Potter series follows the young wizard Harry Potter as he discovers his magical heritage on his eleventh birthday.',
      totalCopies: 5,
      availableCopies: 3,
      coverImageUrl: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400',
    },
    {
      isbn: '978-0-06-112008-4',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      publisher: 'J.B. Lippincott & Co.',
      publishedYear: 1960,
      category: 'Fiction',
      description: 'A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice.',
      totalCopies: 4,
      availableCopies: 2,
      coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    },
    {
      isbn: '978-0-13-110362-7',
      title: 'The C Programming Language',
      author: 'Brian W. Kernighan, Dennis M. Ritchie',
      publisher: 'Prentice Hall',
      publishedYear: 1988,
      category: 'Programming',
      description: 'The definitive guide to C programming language written by its creators. Essential reading for programmers.',
      totalCopies: 3,
      availableCopies: 1,
      coverImageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    },
    {
      isbn: '978-0-596-52068-7',
      title: 'JavaScript: The Good Parts',
      author: 'Douglas Crockford',
      publisher: 'O\'Reilly Media',
      publishedYear: 2008,
      category: 'Programming',
      description: 'A deep dive into JavaScript, revealing the elegant core features beneath the surface quirks.',
      totalCopies: 4,
      availableCopies: 4,
      coverImageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
    },
    {
      isbn: '978-1-59327-584-6',
      title: 'Python Crash Course',
      author: 'Eric Matthes',
      publisher: 'No Starch Press',
      publishedYear: 2015,
      category: 'Programming',
      description: 'A hands-on, project-based introduction to programming in Python for complete beginners.',
      totalCopies: 6,
      availableCopies: 5,
      coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
    },
    {
      isbn: '978-0-316-76948-0',
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      publisher: 'Little, Brown and Company',
      publishedYear: 1951,
      category: 'Fiction',
      description: 'The story of teenage rebellion and alienation that has become a classic of 20th-century literature.',
      totalCopies: 3,
      availableCopies: 0,
      coverImageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    },
    {
      isbn: '978-0-14-017739-8',
      title: '1984',
      author: 'George Orwell',
      publisher: 'Secker & Warburg',
      publishedYear: 1949,
      category: 'Fiction',
      description: 'A dystopian novel set in a totalitarian society ruled by Big Brother, exploring themes of surveillance and propaganda.',
      totalCopies: 5,
      availableCopies: 3,
      coverImageUrl: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400',
    },
    {
      isbn: '978-0-547-92822-7',
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      publisher: 'George Allen & Unwin',
      publishedYear: 1937,
      category: 'Fantasy',
      description: 'A fantasy novel about Bilbo Baggins\' unexpected journey with wizards and dwarves to reclaim treasure from a dragon.',
      totalCopies: 4,
      availableCopies: 2,
      coverImageUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400',
    },
    {
      isbn: '978-0-307-58837-1',
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      publisher: 'Harper',
      publishedYear: 2011,
      category: 'History',
      description: 'Explores the history of humankind from the Stone Age to the modern age, examining how biology and history have defined us.',
      totalCopies: 5,
      availableCopies: 4,
      coverImageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
    },
    {
      isbn: '978-0-7432-7356-5',
      title: 'The Da Vinci Code',
      author: 'Dan Brown',
      publisher: 'Doubleday',
      publishedYear: 2003,
      category: 'Mystery',
      description: 'A murder mystery thriller that follows symbologist Robert Langdon as he investigates a murder in the Louvre Museum.',
      totalCopies: 4,
      availableCopies: 1,
      coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    },
    {
      isbn: '978-1-59184-849-0',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      publisher: 'Prentice Hall',
      publishedYear: 2008,
      category: 'Programming',
      description: 'A handbook of agile software craftsmanship, teaching the principles of writing clean, maintainable code.',
      totalCopies: 5,
      availableCopies: 3,
      coverImageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400',
    },
    {
      isbn: '978-0-06-231500-7',
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      publisher: 'Farrar, Straus and Giroux',
      publishedYear: 2011,
      category: 'Science',
      description: 'Explores the two systems that drive the way we think and make decisions, revealing cognitive biases.',
      totalCopies: 3,
      availableCopies: 2,
      coverImageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    },
    {
      isbn: '978-0-7432-7357-2',
      title: 'The Innovator\'s Dilemma',
      author: 'Clayton M. Christensen',
      publisher: 'Harvard Business Review Press',
      publishedYear: 1997,
      category: 'Business',
      description: 'Examines how successful companies can fail by making the wrong decisions when faced with disruptive innovation.',
      totalCopies: 3,
      availableCopies: 3,
      coverImageUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400',
    },
    {
      isbn: '978-0-201-63361-0',
      title: 'Design Patterns',
      author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
      publisher: 'Addison-Wesley',
      publishedYear: 1994,
      category: 'Programming',
      description: 'The classic software design patterns book by the Gang of Four, essential for object-oriented programming.',
      totalCopies: 4,
      availableCopies: 2,
      coverImageUrl: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=400',
    },
    {
      isbn: '978-0-06-085052-4',
      title: 'Brave New World',
      author: 'Aldous Huxley',
      publisher: 'Chatto & Windus',
      publishedYear: 1932,
      category: 'Fiction',
      description: 'A dystopian novel depicting a futuristic society controlled by technology, conditioning, and a rigid caste system.',
      totalCopies: 3,
      availableCopies: 1,
      coverImageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
    },
  ];

  for (const book of books) {
    const createdBook = await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {},
      create: book,
    });

    // Create book copies for each book
    const copiesToCreate = book.totalCopies || 0;
    const availableCopies = book.availableCopies || 0;

    for (let i = 0; i < copiesToCreate; i++) {
      const isAvailable = i < availableCopies;
      const barcode = `BC-${createdBook.id}-${String(i + 1).padStart(3, '0')}`;
      const rfidTag = `RF-${createdBook.id}-${String(i + 1).padStart(3, '0')}`;

      await prisma.bookCopy.upsert({
        where: { barcode },
        update: {},
        create: {
          bookId: createdBook.id,
          barcode,
          rfidTag,
          status: isAvailable ? 'available' : 'on_loan',
          condition: 'good',
          location: 'Main Library - Section A',
        },
      });
    }
  }

  console.log(`✅ Created ${books.length} books with their copies`);

  // Create dummy members with various scenarios
  console.log('Creating dummy members...');

  const memberRole = await prisma.role.findUnique({ where: { name: 'MEMBER' } });
  if (!memberRole) throw new Error('Member role not found');

  const dummyMembers = [
    {
      username: 'John Smith',
      email: 'john.smith@student.edu',
      loginId: 'MEM-001',
      studentId: 'STU-2024-001',
      department: 'Computer Science',
      phoneNumber: '+1-555-0101',
      address: '123 Campus Drive, Apt 4B',
    },
    {
      username: 'Sarah Johnson',
      email: 'sarah.johnson@student.edu',
      loginId: 'MEM-002',
      studentId: 'STU-2024-002',
      department: 'Engineering',
      phoneNumber: '+1-555-0102',
      address: '456 University Ave, Room 12',
    },
    {
      username: 'Michael Chen',
      email: 'michael.chen@student.edu',
      loginId: 'MEM-003',
      studentId: 'STU-2024-003',
      department: 'Mathematics',
      phoneNumber: '+1-555-0103',
      address: '789 College Street',
    },
    {
      username: 'Emily Davis',
      email: 'emily.davis@student.edu',
      loginId: 'MEM-004',
      studentId: 'STU-2024-004',
      department: 'Literature',
      phoneNumber: '+1-555-0104',
      address: '321 Academic Blvd',
    },
    {
      username: 'David Wilson',
      email: 'david.wilson@student.edu',
      loginId: 'MEM-005',
      studentId: 'STU-2024-005',
      department: 'Business',
      phoneNumber: '+1-555-0105',
      address: '654 Scholar Lane',
    },
    {
      username: 'Jessica Martinez',
      email: 'jessica.martinez@student.edu',
      loginId: 'MEM-006',
      studentId: 'STU-2024-006',
      department: 'Computer Science',
      phoneNumber: '+1-555-0106',
      address: '987 Education St',
    },
    {
      username: 'Robert Taylor',
      email: 'robert.taylor@student.edu',
      loginId: 'MEM-007',
      studentId: 'STU-2024-007',
      department: 'History',
      phoneNumber: '+1-555-0107',
      address: '147 Knowledge Ave',
    },
    {
      username: 'Lisa Anderson',
      email: 'lisa.anderson@student.edu',
      loginId: 'MEM-008',
      studentId: 'STU-2024-008',
      department: 'Biology',
      phoneNumber: '+1-555-0108',
      address: '258 Research Park',
    },
  ];

  const memberPasswordHash = await bcrypt.hash('Member@123', 10);
  const createdMembers = [];

  for (const memberData of dummyMembers) {
    const user = await prisma.user.upsert({
      where: { loginId: memberData.loginId },
      update: {},
      create: {
        username: memberData.username,
        email: memberData.email,
        passwordHash: memberPasswordHash,
        loginId: memberData.loginId,
        accountType: 'MEMBER',
        emailVerified: true,
        isActive: true,
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: memberRole.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: memberRole.id,
      },
    });

    const member = await prisma.member.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        studentOrStaffId: memberData.studentId,
        department: memberData.department,
        phoneNumber: memberData.phoneNumber,
        address: memberData.address,
        maxBorrowedBooks: 5,
      },
    });

    createdMembers.push({ user, member });
  }

  console.log(`✅ Created ${createdMembers.length} dummy members`);

  // Create loans for members
  console.log('Creating loans for members...');

  const allBookCopies = await prisma.bookCopy.findMany({
    where: { status: 'on_loan' },
  });

  const loansData = [
    // John Smith - 3 books, 1 overdue
    { memberIndex: 0, copyIndex: 0, daysAgo: 25, daysUntilDue: -5, status: 'overdue' },
    { memberIndex: 0, copyIndex: 1, daysAgo: 10, daysUntilDue: 4, status: 'ongoing' },
    { memberIndex: 0, copyIndex: 2, daysAgo: 5, daysUntilDue: 9, status: 'ongoing' },
    
    // Sarah Johnson - 2 books, both on time
    { memberIndex: 1, copyIndex: 3, daysAgo: 7, daysUntilDue: 7, status: 'ongoing' },
    { memberIndex: 1, copyIndex: 4, daysAgo: 3, daysUntilDue: 11, status: 'ongoing' },
    
    // Michael Chen - 1 book, heavily overdue
    { memberIndex: 2, copyIndex: 5, daysAgo: 35, daysUntilDue: -21, status: 'overdue' },
    
    // Emily Davis - 4 books (max user), 2 overdue
    { memberIndex: 3, copyIndex: 6, daysAgo: 18, daysUntilDue: -4, status: 'overdue' },
    { memberIndex: 3, copyIndex: 7, daysAgo: 20, daysUntilDue: -6, status: 'overdue' },
    { memberIndex: 3, copyIndex: 8, daysAgo: 8, daysUntilDue: 6, status: 'ongoing' },
    { memberIndex: 3, copyIndex: 9, daysAgo: 2, daysUntilDue: 12, status: 'ongoing' },
    
    // David Wilson - 1 book, returned late
    { memberIndex: 4, copyIndex: 10, daysAgo: 30, daysUntilDue: -16, status: 'returned', returnedDaysAgo: 2 },
    
    // Jessica Martinez - 2 books, on time
    { memberIndex: 5, copyIndex: 11, daysAgo: 6, daysUntilDue: 8, status: 'ongoing' },
    { memberIndex: 5, copyIndex: 12, daysAgo: 4, daysUntilDue: 10, status: 'ongoing' },
  ];

  const createdLoans = [];
  for (const loanData of loansData) {
    if (loanData.copyIndex >= allBookCopies.length) continue;

    const member = createdMembers[loanData.memberIndex].member;
    const bookCopy = allBookCopies[loanData.copyIndex];

    const borrowDate = new Date();
    borrowDate.setDate(borrowDate.getDate() - loanData.daysAgo);

    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period

    let returnDate = null;
    if (loanData.status === 'returned' && loanData.returnedDaysAgo !== undefined) {
      returnDate = new Date();
      returnDate.setDate(returnDate.getDate() - loanData.returnedDaysAgo);
    }

    const loan = await prisma.loan.create({
      data: {
        memberId: member.id,
        bookCopyId: bookCopy.id,
        borrowDatetime: borrowDate,
        dueDatetime: dueDate,
        returnDatetime: returnDate,
        status: loanData.status,
        renewalCount: 0,
      },
    });

    createdLoans.push(loan);

    // Create admin notification for book borrowed
    await prisma.notification.create({
      data: {
        userId: adminUser.id,
        type: 'ADMIN_BOOK_BORROWED',
        title: 'Book Borrowed',
        message: `${createdMembers[loanData.memberIndex].user.username} borrowed a book (Copy #${bookCopy.barcode})`,
        channel: 'in_app',
      },
    });
  }

  console.log(`✅ Created ${createdLoans.length} loans`);

  // Create holds for members with issues
  console.log('Creating holds for problematic members...');

  const holdsData = [
    { memberIndex: 2, reason: 'Multiple overdue books', daysAgo: 5 }, // Michael Chen
    { memberIndex: 3, reason: 'Unpaid fines exceeding $50', daysAgo: 3 }, // Emily Davis
  ];

  for (const holdData of holdsData) {
    const member = createdMembers[holdData.memberIndex].member;
    
    const holdDate = new Date();
    holdDate.setDate(holdDate.getDate() - holdData.daysAgo);

    // Find a loan for this member to associate with the hold
    const loan = createdLoans.find(l => l.memberId === member.id);

    if (loan) {
      await prisma.hold.create({
        data: {
          memberId: member.id,
          loanId: loan.id,
          reason: holdData.reason,
          placedBy: adminUser.id,
          placedAt: holdDate,
          status: 'active',
        },
      });

      // Admin notification for hold
      await prisma.notification.create({
        data: {
          userId: adminUser.id,
          type: 'ADMIN_HOLD_PLACED',
          title: 'Account Hold Placed',
          message: `Hold placed on ${createdMembers[holdData.memberIndex].user.username}'s account: ${holdData.reason}`,
          channel: 'in_app',
        },
      });

      // Member notification
      await prisma.notification.create({
        data: {
          userId: createdMembers[holdData.memberIndex].user.id,
          type: 'HOLD_PLACED',
          title: 'Account Hold',
          message: `Your account has been placed on hold: ${holdData.reason}`,
          channel: 'in_app',
        },
      });
    }
  }

  console.log(`✅ Created ${holdsData.length} holds`);

  // Create fines for overdue books
  console.log('Creating fines for overdue books...');

  const finesData = [
    { memberIndex: 0, amount: 5.00, reason: 'Overdue book (5 days)', isPaid: false, loanIndex: 0 },
    { memberIndex: 2, amount: 21.00, reason: 'Overdue book (21 days)', isPaid: false, loanIndex: 5 },
    { memberIndex: 3, amount: 4.00, reason: 'Overdue book (4 days)', isPaid: false, loanIndex: 6 },
    { memberIndex: 3, amount: 6.00, reason: 'Overdue book (6 days)', isPaid: false, loanIndex: 7 },
    { memberIndex: 4, amount: 16.00, reason: 'Late return (16 days overdue)', isPaid: true, loanIndex: 10 },
  ];

  for (const fineData of finesData) {
    const member = createdMembers[fineData.memberIndex].member;
    const loan = createdLoans[fineData.loanIndex];

    if (!loan) continue;

    const fine = await prisma.fine.create({
      data: {
        memberId: member.id,
        loanId: loan.id,
        amount: fineData.amount,
        reason: fineData.reason,
        chargedBy: adminUser.id,
        status: fineData.isPaid ? 'paid' : 'unpaid',
        paidAt: fineData.isPaid ? new Date() : null,
        paidAmount: fineData.isPaid ? fineData.amount : null,
      },
    });

    // Admin notification for fine
    if (fineData.isPaid) {
      await prisma.notification.create({
        data: {
          userId: adminUser.id,
          type: 'ADMIN_FINE_PAID',
          title: 'Fine Paid',
          message: `${createdMembers[fineData.memberIndex].user.username} paid a fine of $${fineData.amount.toFixed(2)}`,
          channel: 'in_app',
        },
      });
    } else {
      await prisma.notification.create({
        data: {
          userId: adminUser.id,
          type: 'ADMIN_FINE_CHARGED',
          title: 'Fine Charged',
          message: `Fine of $${fineData.amount.toFixed(2)} charged to ${createdMembers[fineData.memberIndex].user.username}`,
          channel: 'in_app',
        },
      });

      // Member notification
      await prisma.notification.create({
        data: {
          userId: createdMembers[fineData.memberIndex].user.id,
          type: 'FINE_CHARGED',
          title: 'Fine Charged',
          message: `You have been charged a fine of $${fineData.amount.toFixed(2)} for: ${fineData.reason}`,
          channel: 'in_app',
        },
      });
    }
  }

  console.log(`✅ Created ${finesData.length} fines`);

  // Create overdue notifications for admin
  console.log('Creating overdue notifications...');

  const overdueLoans = createdLoans.filter(l => l.status === 'overdue');
  for (const loan of overdueLoans) {
    const member = createdMembers.find(m => m.member.id === loan.memberId);
    if (!member) continue;

    const daysOverdue = Math.floor((new Date().getTime() - loan.dueDatetime.getTime()) / (1000 * 60 * 60 * 24));

    await prisma.notification.create({
      data: {
        userId: adminUser.id,
        type: 'ADMIN_BOOK_OVERDUE',
        title: 'Overdue Book',
        message: `${member.user.username} has an overdue book (${daysOverdue} days overdue)`,
        channel: 'in_app',
      },
    });

    // Member notification
    await prisma.notification.create({
      data: {
        userId: member.user.id,
        type: 'OVERDUE_WARNING',
        title: 'Overdue Book',
        message: `You have an overdue book. Please return it as soon as possible. ${daysOverdue} days overdue.`,
        channel: 'in_app',
      },
    });
  }

  console.log(`✅ Created overdue notifications`);

  // Summary
  console.log('\n📊 SEED SUMMARY:');
  console.log(`   👥 Members: ${createdMembers.length}`);
  console.log(`   📚 Books: ${books.length}`);
  console.log(`   📖 Loans: ${createdLoans.length}`);
  console.log(`   ⚠️  Overdue Loans: ${overdueLoans.length}`);
  console.log(`   🚫 Holds: ${holdsData.length}`);
  console.log(`   💰 Fines: ${finesData.length}`);
  console.log(`   🔔 Admin Notifications: Multiple`);
  
  console.log('\n📝 Test Member Credentials (All use password: Member@123):');
  console.log('   MEM-001 - John Smith (3 books, 1 overdue, 1 fine)');
  console.log('   MEM-002 - Sarah Johnson (2 books, on time)');
  console.log('   MEM-003 - Michael Chen (1 book heavily overdue, account on hold, 1 fine)');
  console.log('   MEM-004 - Emily Davis (4 books, 2 overdue, account on hold, 2 fines)');
  console.log('   MEM-005 - David Wilson (returned late, paid fine)');
  console.log('   MEM-006 - Jessica Martinez (2 books, on time)');
  console.log('   MEM-007 - Robert Taylor (no activity)');
  console.log('   MEM-008 - Lisa Anderson (no activity)');

  console.log('\n✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
