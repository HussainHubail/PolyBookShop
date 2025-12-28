# 🎓 PolyBookShop - Complete Documentation

**Professional University Library Management System**

A comprehensive, enterprise-grade full-stack web application for managing university library operations including books, members, loans, holds, fines, and automated notifications.

![PolyBookShop Logo](../Logo/logo.svg)

---

## 📚 Documentation Sections

This documentation is organized into the following sections:

1. **[Overview](./01-OVERVIEW.md)** - What is PolyBookShop and why use it?
2. **[Features](./02-FEATURES.md)** - Complete feature list for all user types
3. **[Technology Stack](./03-TECH-STACK.md)** - Technical architecture and tools
4. **[Installation Guide](./04-INSTALLATION.md)** - Step-by-step setup instructions
5. **[Authentication & Security](./05-AUTHENTICATION.md)** - Login system and security features
6. **[API Reference](./06-API-REFERENCE.md)** - Complete API endpoint documentation
7. **[Database Schema](./07-DATABASE.md)** - Database design and relationships

---

## 🚀 Quick Start

### Prerequisites
- ✅ **Node.js** (v18+) - [Download](https://nodejs.org/)
- ✅ **PostgreSQL** - [Neon (Free)](https://neon.tech/)
- ✅ **VS Code** (recommended)

### Automated Setup (Recommended)

**Windows:**
```powershell
.\setup.ps1
```

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

```powershell
# Backend
cd Backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev  # http://localhost:5000

# Frontend (new terminal)
cd Frontend
npm install
npm run dev  # http://localhost:3000
```

📖 **For detailed instructions, see [Installation Guide](./04-INSTALLATION.md)**

---

## 💡 What is PolyBookShop?

**PolyBookShop** is a modern library management system designed for universities with:

- ✅ **Complete Automation** - Email notifications, scheduled tasks, fine calculations
- ✅ **Enterprise Security** - JWT auth, rate limiting, RBAC
- ✅ **Modern Stack** - TypeScript, React 18, Prisma, PostgreSQL
- ✅ **Production Ready** - Toast notifications, error handling, comprehensive logging
- ✅ **User Friendly** - Responsive design, intuitive UI, debounced search

### Core Capabilities

1. **Three-Tier Authentication** (Admin, Librarian, Member)
2. **Email Verification** with unique login IDs
3. **Automated Loan Confirmations** via email
4. **Comprehensive Audit Trails** (SYSTEM_LOG)
5. **Fine Management** with automatic calculations
6. **Hold System** for book availability
7. **RESTful API** with role-based access
8. **Real-time Search** with 500ms debounce
9. **Rate Limiting** to prevent brute force
10. **Scheduled Jobs** for automated tasks

---

## ✨ Key Features

### For Members (Students/Staff)
- 📝 Self-registration with email verification
- 🔍 Advanced search (5 fields: title, author, ISBN, category, description)
- 📖 Borrow books with automated email confirmations
- 📅 Loan management with due date reminders
- 🎯 Place holds on unavailable books
- 💰 View and pay fines online
- 🌐 Access PDF books with download capability

### For Librarians
- 📚 Complete book and copy management (CRUD)
- ✅ Process loans with automatic email notifications
- 🔄 Handle returns with automatic fine calculations
- 🎯 Manage holds and fulfill reservations
- 💵 Process fine payments and waivers
- 📊 View reports and statistics

### For Administrators
- 🛡️ Full system access
- 👤 User and role management
- 📈 System analytics and insights
- 🗄️ Database management and backups
- 📜 Audit log viewing with filters

📖 **For complete feature list, see [Features](./02-FEATURES.md)**

---

## 🛠️ Technology Stack

### Backend
- **Node.js 20+** + **Express.js** + **TypeScript 5.3**
- **PostgreSQL 15+** (Neon cloud) + **Prisma 5.7** ORM
- **JWT** authentication + **bcrypt** password hashing
- **express-rate-limit** for security
- **Nodemailer** for email notifications
- **node-cron** for scheduled tasks

### Frontend
- **React 18.3** + **TypeScript 5.5** + **Vite 5.4**
- **Tailwind CSS 3.4** with GPU acceleration
- **Zustand** state management
- **React Router DOM v6** routing
- **Axios** HTTP client
- **react-hot-toast** notifications

📖 **For detailed stack information, see [Technology Stack](./03-TECH-STACK.md)**

---

## 📁 Project Structure

```
Polybookshop/
├── Backend/                    # Node.js + Express + Prisma API
│   ├── prisma/                # Database schema & migrations
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Auth, rate limiting
│   │   ├── routes/            # API routes
│   │   └── utils/             # Helpers (JWT, logger)
│   └── .env                   # Environment variables
│
├── Frontend/                   # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/             # Route pages
│   │   ├── components/        # Reusable UI components
│   │   ├── store/             # Zustand state
│   │   └── lib/               # API client
│   └── .env                   # Environment variables
│
├── Documentation/              # Complete documentation
│   ├── 01-OVERVIEW.md
│   ├── 02-FEATURES.md
│   ├── 03-TECH-STACK.md
│   ├── 04-INSTALLATION.md
│   ├── 05-AUTHENTICATION.md
│   ├── 06-API-REFERENCE.md
│   └── 07-DATABASE.md
│
├── Logo/                       # Brand assets
├── Diagrams/                   # System design diagrams
├── UI_Design/                  # UI prototypes
├── setup.ps1                   # Windows setup script
├── setup.sh                    # Linux/macOS setup script
└── README.md                   # This file
```

---

## 🔐 Authentication

### Default Admin Credentials

**⚠️ Change immediately after first login!**

- **Admin**: `ADM-ADMIN1` / `Admin@123`
- **Librarian**: `LIB-LIB001` / `Librarian@123`

### Member Signup Flow

1. User submits signup form
2. System generates unique Member ID (e.g., `MEM-A3B7C2`)
3. Verification email sent with login ID
4. User clicks verification link
5. User logs in with Member ID + password

### Security Features

- **Rate Limiting**: Login (5/15min), Signup (3/hr), Verification (3/hr)
- **Password Security**: bcrypt hashing, strong requirements
- **JWT Tokens**: 7-day expiration, HS256 algorithm
- **Account Type Verification**: Prevents cross-role login attempts

📖 **For complete authentication details, see [Authentication & Security](./05-AUTHENTICATION.md)**

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Quick Examples

**Member Signup:**
```http
POST /api/auth/member/signup
{
  "username": "John Doe",
  "email": "john@university.edu",
  "password": "SecurePass@123",
  "department": "Computer Science"
}
```

**Login:**
```http
POST /api/auth/login
{
  "loginId": "MEM-A3B7C2",
  "password": "SecurePass@123",
  "accountType": "MEMBER"
}
```

**Search Books:**
```http
GET /api/books?search=python&category=Programming&page=1&limit=20
```

📖 **For complete API documentation, see [API Reference](./06-API-REFERENCE.md)**

---

## 🗄️ Database Schema

### Overview
- **Database**: PostgreSQL 15+
- **Total Tables**: 12 essential tables
- **ORM**: Prisma with type-safe client
- **Hosting**: Neon (serverless PostgreSQL)

### Core Tables
- **User** - All user accounts
- **Member** - Extended member profiles
- **Book** - Book catalog
- **BookCopy** - Physical book copies
- **Loan** - Borrowing transactions
- **Hold** - Book hold queue
- **Fine** - Overdue fines
- **Notification** - User notifications
- **SystemLog** - Audit trail

📖 **For complete schema documentation, see [Database Schema](./07-DATABASE.md)**

---

## 🚢 Deployment

### Production Build

**Backend:**
```powershell
cd Backend
npm run build
npm start
```

**Frontend:**
```powershell
cd Frontend
npm run build
# Serve dist/ folder with nginx or similar
```

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL="postgresql://user:pass@host/db"
JWT_SECRET="your-secret-key-min-32-chars"
PORT=5000
NODE_ENV=production
FRONTEND_URL="https://your-domain.com"
```

**Frontend (.env):**
```env
VITE_API_URL=https://api.your-domain.com/api
```

---

## 🧪 Development Commands

### Backend
```powershell
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Run production server
npx prisma generate      # Generate Prisma Client
npx prisma migrate deploy # Apply migrations
npx prisma studio        # Open database GUI
```

### Frontend
```powershell
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

---

## 🐛 Troubleshooting

### Common Issues

**"Database connection failed"**
- Verify `DATABASE_URL` in `Backend/.env`
- Check Neon dashboard for connection status
- Test with: `npx prisma db push`

**"Port already in use"**
```powershell
# Find process using port
netstat -ano | findstr :5000
# Kill process
taskkill /PID <process_id> /F
```

**"Prisma Client not generated"**
```powershell
cd Backend
npx prisma generate
```

**"Email not sending"**
- For Gmail: Use App Password (not regular password)
- Enable 2FA, generate at: https://myaccount.google.com/apppasswords

📖 **For more troubleshooting, see [Installation Guide](./04-INSTALLATION.md)**

---

## 📞 Support

For issues or questions:
- Review documentation sections above
- Check troubleshooting section
- Review system logs
- Contact development team

---

## 📝 License

MIT License

---

## 👨‍💻 Author

**MHameedi**

---

## 🙏 Acknowledgments

- University Library Staff for requirements
- Open-source community for excellent tools
- Contributors and testers

---

**⭐ If you find this project useful, please give it a star!**
