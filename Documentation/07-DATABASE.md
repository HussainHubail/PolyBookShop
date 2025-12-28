# 🗄️ Database Schema

## Overview

PolyBookShop uses **PostgreSQL 15+** with **Prisma ORM** for type-safe database access.

**Total Tables**: 12 essential tables
**Relationships**: Fully normalized with foreign key constraints
**Indexing**: Optimized for common queries

---

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     USER     │──────<│  USER_ROLE   │>──────│     ROLE     │
│              │       │              │       │              │
│ - id         │       │ - userId     │       │ - id         │
│ - username   │       │ - roleId     │       │ - name       │
│ - email      │       └──────────────┘       └──────────────┘
│ - password   │
│ - loginId    │
│ - accountType│
│ - verified   │
└───────┬──────┘
        │ 1:1
        ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    MEMBER    │──────<│     LOAN     │>──────│  BOOK_COPY   │
│              │       │              │       │              │
│ - id         │       │ - id         │       │ - id         │
│ - userId     │       │ - memberId   │       │ - bookId     │
│ - department │       │ - copyId     │       │ - barcode    │
│ - phone      │       │ - borrowDate │       │ - status     │
└───────┬──────┘       │ - dueDate    │       │ - condition  │
        │              │ - returnDate │       │ - location   │
        │              │ - status     │       └───────┬──────┘
        │              └──────────────┘               │
        │ 1:N                 │ 1:1                   │ N:1
        │                     ▼                       ▼
        │              ┌──────────────┐       ┌──────────────┐
        │              │     FINE     │       │     BOOK     │
        │              │              │       │              │
        │              │ - id         │       │ - id         │
        │              │ - loanId     │       │ - title      │
        │              │ - amount     │       │ - author     │
        │              │ - status     │       │ - isbn       │
        │              │ - reason     │       │ - category   │
        │              └──────────────┘       │ - year       │
        │                                     │ - bookType   │
        │ 1:N                                 └───────┬──────┘
        └─────────────────────────────────────┐      │ 1:N
                                              │      ▼
┌──────────────┐       ┌──────────────┐      │┌──────────────┐
│ NOTIFICATION │       │     HOLD     │◄─────┘│ RESERVATION  │
│              │       │              │       │              │
│ - id         │       │ - id         │       │ - id         │
│ - userId     │       │ - memberId   │       │ - bookId     │
│ - type       │       │ - bookId     │       │ - memberId   │
│ - title      │       │ - status     │       │ - status     │
│ - message    │       │ - position   │       │ - expiresAt  │
│ - read       │       │ - expiresAt  │       └──────────────┘
└──────────────┘       └──────────────┘

┌──────────────┐
│ SYSTEM_LOG   │
│              │
│ - id         │
│ - userId     │
│ - level      │
│ - action     │
│ - details    │
│ - ipAddress  │
│ - userAgent  │
│ - createdAt  │
└──────────────┘
```

---

## Table Definitions

### 1. User Table
Stores all user accounts (Admin, Librarian, Member).

```prisma
model User {
  id            Int      @id @default(autoincrement())
  username      String
  email         String   @unique
  password      String
  loginId       String   @unique
  accountType   AccountType
  verified      Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  roles         UserRole[]
  member        Member?
  notifications Notification[]
  logs          SystemLog[]
}

enum AccountType {
  ADMIN
  LIBRARIAN
  MEMBER
}
```

**Indexes:**
- `email` (unique)
- `loginId` (unique)
- `accountType`

---

### 2. Role Table
Defines system roles for RBAC.

```prisma
model Role {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())
  
  // Relations
  users       UserRole[]
}
```

**Default Roles:**
- `ADMIN` - Full system access
- `LIBRARIAN` - Library operations
- `MEMBER` - Self-service features

---

### 3. UserRole Table
Many-to-many relationship between Users and Roles.

```prisma
model UserRole {
  id        Int      @id @default(autoincrement())
  userId    Int
  roleId    Int
  createdAt DateTime @default(now())
  
  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
  
  @@unique([userId, roleId])
  @@index([userId])
  @@index([roleId])
}
```

---

### 4. Member Table
Extended profile for member users.

```prisma
model Member {
  id          Int      @id @default(autoincrement())
  userId      Int      @unique
  department  String
  phoneNumber String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  loans       Loan[]
  holds       Hold[]
  fines       Fine[]
  reservations Reservation[]
}
```

---

### 5. Book Table
Stores book catalog information.

```prisma
model Book {
  id            Int      @id @default(autoincrement())
  title         String
  author        String
  isbn          String   @unique
  category      String
  publishedYear Int
  description   String?
  bookType      BookType @default(PHYSICAL)
  pdfPath       String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  copies        BookCopy[]
  holds         Hold[]
  reservations  Reservation[]
}

enum BookType {
  PHYSICAL
  ONLINE
}
```

**Indexes:**
- `isbn` (unique)
- `title`
- `author`
- `category`
- `bookType`

---

### 6. BookCopy Table
Individual physical copies of books.

```prisma
model BookCopy {
  id        Int        @id @default(autoincrement())
  bookId    Int
  barcode   String     @unique
  status    CopyStatus @default(AVAILABLE)
  condition Condition  @default(GOOD)
  location  String?
  rfidTag   String?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  
  // Relations
  book      Book       @relation(fields: [bookId], references: [id], onDelete: Cascade)
  loans     Loan[]
}

enum CopyStatus {
  AVAILABLE
  ON_LOAN
  RESERVED
  MAINTENANCE
  LOST
}

enum Condition {
  NEW
  GOOD
  FAIR
  DAMAGED
}
```

**Indexes:**
- `barcode` (unique)
- `bookId`
- `status`

---

### 7. Loan Table
Tracks book borrowing transactions.

```prisma
model Loan {
  id         Int       @id @default(autoincrement())
  memberId   Int
  copyId     Int
  borrowDate DateTime  @default(now())
  dueDate    DateTime
  returnDate DateTime?
  status     LoanStatus @default(ONGOING)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  
  // Relations
  member     Member    @relation(fields: [memberId], references: [id])
  copy       BookCopy  @relation(fields: [copyId], references: [id])
  fine       Fine?
}

enum LoanStatus {
  ONGOING
  RETURNED
  OVERDUE
}
```

**Indexes:**
- `memberId`
- `copyId`
- `status`
- `dueDate`

---

### 8. Fine Table
Manages overdue fines and payments.

```prisma
model Fine {
  id          Int         @id @default(autoincrement())
  loanId      Int         @unique
  memberId    Int
  amount      Decimal     @db.Decimal(10, 2)
  reason      String
  status      FineStatus  @default(UNPAID)
  chargedBy   Int?
  paidAt      DateTime?
  paymentMethod String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Relations
  loan        Loan        @relation(fields: [loanId], references: [id])
  member      Member      @relation(fields: [memberId], references: [id])
  chargedByUser User?     @relation(fields: [chargedBy], references: [id])
}

enum FineStatus {
  UNPAID
  PAID
  WAIVED
}
```

**Indexes:**
- `loanId` (unique)
- `memberId`
- `status`

---

### 9. Hold Table
Book hold/reservation queue system.

```prisma
model Hold {
  id          Int        @id @default(autoincrement())
  memberId    Int
  bookId      Int
  status      HoldStatus @default(ACTIVE)
  queuePosition Int
  expiresAt   DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  // Relations
  member      Member     @relation(fields: [memberId], references: [id])
  book        Book       @relation(fields: [bookId], references: [id])
}

enum HoldStatus {
  ACTIVE
  READY
  FULFILLED
  EXPIRED
  CANCELLED
}
```

**Indexes:**
- `memberId`
- `bookId`
- `status`

---

### 10. Reservation Table
Alternative reservation system (legacy support).

```prisma
model Reservation {
  id          Int              @id @default(autoincrement())
  memberId    Int
  bookId      Int
  status      ReservationStatus @default(PENDING)
  expiresAt   DateTime
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  
  // Relations
  member      Member           @relation(fields: [memberId], references: [id])
  book        Book             @relation(fields: [bookId], references: [id])
}

enum ReservationStatus {
  PENDING
  FULFILLED
  CANCELLED
  EXPIRED
}
```

---

### 11. Notification Table
User notifications (email, in-app, SMS).

```prisma
model Notification {
  id          Int              @id @default(autoincrement())
  userId      Int
  type        NotificationType
  title       String
  message     String
  read        Boolean          @default(false)
  channel     String[]         // ['EMAIL', 'IN_APP', 'SMS']
  createdAt   DateTime         @default(now())
  
  // Relations
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum NotificationType {
  LOAN_CONFIRMATION
  DUE_REMINDER
  OVERDUE_WARNING
  HOLD_READY
  FINE_CHARGED
  PAYMENT_RECEIVED
  ACCOUNT_VERIFIED
  SYSTEM_ANNOUNCEMENT
}
```

**Indexes:**
- `userId`
- `read`
- `createdAt`

---

### 12. SystemLog Table
Comprehensive audit trail of all system operations.

```prisma
model SystemLog {
  id          Int       @id @default(autoincrement())
  userId      Int?
  level       LogLevel
  action      LogAction
  details     Json
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime  @default(now())
  
  // Relations
  user        User?     @relation(fields: [userId], references: [id])
}

enum LogLevel {
  INFO
  WARN
  ERROR
}

enum LogAction {
  // Auth
  USER_SIGNUP
  USER_LOGIN
  EMAIL_VERIFICATION
  
  // Books
  CREATE_BOOK
  UPDATE_BOOK
  DELETE_BOOK
  CREATE_COPY
  UPDATE_COPY
  DELETE_COPY
  
  // Loans
  CREATE_LOAN
  RETURN_LOAN
  RENEW_LOAN
  
  // Fines & Holds
  CREATE_FINE
  PAY_FINE
  WAIVE_FINE
  PLACE_HOLD
  REMOVE_HOLD
  
  // System
  SYSTEM_STARTUP
  SYSTEM_SHUTDOWN
  BACKUP_CREATED
  ERROR_OCCURRED
}
```

**Indexes:**
- `userId`
- `level`
- `action`
- `createdAt`

---

## Database Constraints

### Foreign Keys
All foreign keys have `CASCADE` or `SET NULL` delete actions to maintain referential integrity.

### Unique Constraints
- `User.email`
- `User.loginId`
- `Book.isbn`
- `BookCopy.barcode`
- `Fine.loanId`

### Check Constraints
- `Fine.amount` >= 0
- `Hold.queuePosition` >= 1
- `Book.publishedYear` <= current year

---

## Indexes for Performance

### Primary Indexes
- All primary keys automatically indexed

### Secondary Indexes
- `User(email)` - Fast user lookup
- `User(loginId)` - Fast login
- `Book(title, author, category)` - Fast book search
- `Loan(memberId, status, dueDate)` - Fast loan queries
- `Notification(userId, read)` - Fast notification retrieval
- `SystemLog(action, createdAt)` - Fast log analysis

---

## Data Migration

### Initial Migration
```bash
npx prisma migrate deploy
```

### Seed Data
```bash
npx prisma db seed
```

Creates:
- Admin user: `ADM-ADMIN1`
- Librarian user: `LIB-LIB001`
- Default roles: ADMIN, LIBRARIAN, MEMBER

---

## Database Management

### Prisma Studio
Visual database editor:
```bash
npx prisma studio
```
Opens at http://localhost:5555

### Backup
```bash
# PostgreSQL dump
pg_dump -h host -U user -d polybookshop > backup.sql

# Restore
psql -h host -U user -d polybookshop < backup.sql
```

### Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```
