# 📥 Installation Guide

## Prerequisites

Before installing PolyBookShop, ensure you have:

### Required Software
- ✅ **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- ✅ **npm** (comes with Node.js)
- ✅ **PostgreSQL Database** - [Neon (Free)](https://neon.tech/) or local PostgreSQL 15+
- ✅ **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

### Optional but Recommended
- ✅ **Git** - [Download](https://git-scm.com/)
- ✅ **Prisma Studio** (installed with Prisma)
- ✅ **Postman** or similar for API testing

---

## Quick Start (5 Minutes)

### Option 1: Automated Setup (Recommended)

#### Windows Users
```powershell
# Navigate to project directory
cd Polybookshop

# Run setup script
.\setup.ps1
```

#### Linux/macOS Users
```bash
# Navigate to project directory
cd Polybookshop

# Make script executable
chmod +x setup.sh

# Run setup script
./setup.sh
```

The automated script will:
1. ✅ Check Node.js and npm installation
2. ✅ Install all backend dependencies
3. ✅ Install all frontend dependencies
4. ✅ Generate Prisma Client
5. ✅ Optionally run database migrations
6. ✅ Optionally install VS Code extensions

### Option 2: Manual Setup

```powershell
# 1. Backend Setup
cd Backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev

# 2. Frontend Setup (new terminal)
cd Frontend
npm install
npm run dev
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## Detailed Installation Steps

### Step 1: Database Setup

#### Using Neon (Free PostgreSQL - Recommended)

1. **Create Account**
   - Go to [neon.tech](https://neon.tech/)
   - Sign up with GitHub or email
   - No credit card required for free tier

2. **Create Project**
   - Click "New Project"
   - Name: `polybookshop`
   - Region: Choose closest to you (e.g., `aws-ap-southeast-1`)
   - PostgreSQL version: 15+

3. **Get Connection String**
   - Copy the connection string
   - Format: `postgresql://username:password@ep-xxx.aws.neon.tech/dbname?sslmode=require`
   - Save for next step

#### Using Local PostgreSQL

```powershell
# Install PostgreSQL (if not installed)
# Download from: https://www.postgresql.org/download/

# Create database
psql -U postgres
CREATE DATABASE polybookshop;
\q
```

Connection string format:
```
postgresql://postgres:yourpassword@localhost:5432/polybookshop
```

---

### Step 2: Backend Configuration

#### 1. Navigate to Backend Directory
```powershell
cd Backend
```

#### 2. Install Dependencies
```powershell
npm install
```

This installs:
- express, typescript, prisma
- jsonwebtoken, bcrypt
- express-rate-limit, nodemailer
- winston, node-cron
- And all other dependencies

#### 3. Configure Environment Variables

Create `.env` file from template:
```powershell
Copy-Item .env.example .env
```

Edit `Backend/.env`:
```env
# ==========================
# DATABASE CONFIGURATION
# ==========================
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# ==========================
# JWT CONFIGURATION
# ==========================
# Generate a secure random string (minimum 32 characters)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
JWT_EXPIRES_IN="7d"

# ==========================
# SERVER CONFIGURATION
# ==========================
PORT=5000
NODE_ENV=development

# ==========================
# FRONTEND CONFIGURATION
# ==========================
FRONTEND_URL="http://localhost:3000"

# ==========================
# EMAIL CONFIGURATION (Optional)
# ==========================
# For Gmail, use App Password (not regular password)
# Enable 2FA, then generate App Password at: https://myaccount.google.com/apppasswords
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-gmail-app-password"
EMAIL_FROM="PolyBookShop <noreply@polybookshop.com>"
```

**Important Notes:**
- Replace `DATABASE_URL` with your actual connection string
- Generate a strong `JWT_SECRET` (use password generator)
- Email configuration is optional but recommended for full functionality
- Never commit `.env` file to version control

#### 4. Generate Prisma Client
```powershell
npx prisma generate
```

This creates the type-safe Prisma Client based on your schema.

#### 5. Run Database Migrations
```powershell
npx prisma migrate deploy
```

This creates all 12 database tables:
- User, Role, UserRole
- Member, Book, BookCopy
- Loan, Hold, Fine
- Notification, SystemLog, Reservation

#### 6. Seed Database (Optional but Recommended)
```powershell
npx prisma db seed
```

Creates default accounts:
- **Admin**: `ADM-ADMIN1` / `Admin@123`
- **Librarian**: `LIB-LIB001` / `Librarian@123`

⚠️ **Change these passwords after first login!**

#### 7. Start Backend Server
```powershell
npm run dev
```

Server will start on **http://localhost:5000**

You should see:
```
✅ Database connected successfully
✅ Scheduled jobs initialized
🚀 PolyBookShop API server running on port 5000
```

---

### Step 3: Frontend Configuration

#### 1. Navigate to Frontend Directory
```powershell
cd Frontend
```

#### 2. Install Dependencies
```powershell
npm install
```

This installs:
- react, typescript, vite
- tailwindcss, zustand
- react-router-dom, axios
- react-hot-toast, lucide-react
- And all other dependencies

#### 3. Configure Environment Variables (Optional)

Create `.env` file (optional - defaults work):
```powershell
Copy-Item .env.example .env
```

Edit `Frontend/.env`:
```env
# API Base URL
VITE_API_URL=http://localhost:5000/api
```

**Note**: If using default, you can skip this step.

#### 4. Start Frontend Server
```powershell
npm run dev
```

Server will start on **http://localhost:3000**

You should see:
```
VITE v5.4.21  ready in 2739 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

---

### Step 4: Verify Installation

#### 1. Access Frontend
Open browser: **http://localhost:3000**

You should see the login selection page with three options:
- Admin Login
- Librarian Login
- Member Login

#### 2. Test Backend API
Open browser: **http://localhost:5000/health**

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-12-06T..."
}
```

#### 3. Test Database Connection
```powershell
cd Backend
npx prisma studio
```

Opens Prisma Studio at **http://localhost:5555**
- View all database tables
- Browse seeded data
- Verify admin and librarian accounts

#### 4. Test Login
1. Go to http://localhost:3000
2. Click "Admin Login"
3. Enter credentials:
   - Login ID: `ADM-ADMIN1`
   - Password: `Admin@123`
4. Should redirect to admin dashboard

---

## VS Code Extensions (Recommended)

Install these extensions for the best development experience:

### Manual Installation
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search and install:

- **Prisma** (`Prisma.prisma`)
  - Syntax highlighting for Prisma schema
  - Autocomplete for Prisma models
  - Format on save

- **ESLint** (`dbaeumer.vscode-eslint`)
  - JavaScript/TypeScript linting
  - Code quality checks
  - Auto-fix on save

- **Prettier** (`esbenp.prettier-vscode`)
  - Code formatting
  - Consistent style
  - Format on save

- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
  - Tailwind class autocomplete
  - Color previews
  - Syntax highlighting

- **TypeScript Extension Pack** (`loiane.ts-extension-pack`)
  - TypeScript tools bundle
  - Enhanced TypeScript support
  - Debugging tools

### Automated Installation
The setup scripts (`setup.ps1` or `setup.sh`) can install these automatically when prompted.

---

## Troubleshooting

### "Node not found" Error
```powershell
# Verify Node.js installation
node --version
npm --version

# If not installed, download from: https://nodejs.org/
```

### "Database Connection Failed"
```powershell
# Verify DATABASE_URL in Backend/.env
# Test connection
cd Backend
npx prisma db push

# Check Neon dashboard for connection status
```

### "Port Already in Use"
```powershell
# Backend (Port 5000)
# Find process using port
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <process_id> /F

# Or change port in Backend/.env
PORT=5001
```

```powershell
# Frontend (Port 3000)
# Find and kill process
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Or change port in Frontend/vite.config.ts
```

### "Prisma Client Not Generated"
```powershell
cd Backend
npx prisma generate

# If still failing, delete and regenerate
Remove-Item -Recurse node_modules\.prisma
npx prisma generate
```

### "Migration Failed"
```powershell
cd Backend

# Reset database (⚠️ Deletes all data!)
npx prisma migrate reset

# Then re-run migrations
npx prisma migrate deploy

# Re-seed database
npx prisma db seed
```

### "Email Not Sending"
- Verify SMTP credentials in `Backend/.env`
- For Gmail:
  1. Enable 2-Factor Authentication
  2. Generate App Password: https://myaccount.google.com/apppasswords
  3. Use App Password (not regular password)
- Check firewall blocking port 587
- Test with different SMTP provider

### "CORS Error in Browser"
- Verify `FRONTEND_URL` in `Backend/.env` matches frontend URL
- Ensure both servers are running
- Clear browser cache
- Check browser console for specific error

### PowerShell Script Execution Error
```powershell
# Windows: Enable script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Next Steps

After successful installation:

1. ✅ **Change Default Passwords**
   - Login as admin and librarian
   - Update passwords from profile settings

2. ✅ **Configure Email**
   - Set up SMTP credentials
   - Test email notifications

3. ✅ **Add Books**
   - Login as librarian
   - Add books to the catalog

4. ✅ **Create Member Account**
   - Test member signup flow
   - Verify email verification works

5. ✅ **Test Loan Flow**
   - Borrow a book as member
   - Check email confirmation
   - Process return as librarian

6. ✅ **Explore Features**
   - Try all features as different roles
   - Check notification system
   - Test fine management

---

## Development Commands

### Backend Commands
```powershell
cd Backend

npm run dev              # Start development server
npm run build            # Build for production
npm start                # Run production server
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Create new migration
npx prisma migrate deploy # Apply migrations
npx prisma db seed       # Seed database
npx prisma studio        # Open database GUI
```

### Frontend Commands
```powershell
cd Frontend

npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

---

## Production Deployment

See [DEPLOYMENT.md](./05-DEPLOYMENT.md) for detailed production deployment instructions.
