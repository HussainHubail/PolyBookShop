# PolyBookShop Setup Guide

Complete guide to set up and run the PolyBookShop application.

## 📋 Prerequisites

Before running the setup script, ensure you have:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **PostgreSQL Database** (we use Neon - [Get Free Database](https://neon.tech/))
4. **VS Code** (recommended) - [Download](https://code.visualstudio.com/)
5. **Git** (optional) - [Download](https://git-scm.com/)

## 🚀 Quick Start

### Windows Users

1. Open PowerShell in the project root directory
2. Run the setup script:
   ```powershell
   .\setup.ps1
   ```

### Linux/macOS Users

1. Open Terminal in the project root directory
2. Make the script executable:
   ```bash
   chmod +x setup.sh
   ```
3. Run the setup script:
   ```bash
   ./setup.sh
   ```

## 📝 What the Setup Script Does

The automated setup script will:

1. ✅ Check Node.js and npm installation
2. ✅ Install all backend dependencies (Express, Prisma, TypeScript, etc.)
3. ✅ Install all frontend dependencies (React, Vite, Tailwind CSS, etc.)
4. ✅ Generate Prisma Client
5. ✅ Optionally run database migrations
6. ✅ Optionally install recommended VS Code extensions

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually:

### 1. Backend Setup

```bash
# Navigate to Backend directory
cd Backend

# Install dependencies
npm install

# Create .env file (see Configuration section below)
# Then generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy
```

### 2. Frontend Setup

```bash
# Navigate to Frontend directory
cd Frontend

# Install dependencies
npm install
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `Backend` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"

# Email Configuration (Optional - for email notifications)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="PolyBookShop <noreply@polybookshop.com>"
```

### Getting a Database URL (Neon)

1. Go to [Neon.tech](https://neon.tech/)
2. Sign up for a free account
3. Create a new project
4. Copy the connection string
5. Paste it as `DATABASE_URL` in your `.env` file

## 📦 Installed Packages

### Backend Dependencies

- **express** - Web framework
- **prisma** - Database ORM
- **typescript** - Type safety
- **jsonwebtoken** - Authentication
- **bcrypt** - Password hashing
- **express-rate-limit** - Rate limiting
- **node-cron** - Scheduled tasks
- **winston** - Logging
- **cors** - Cross-origin requests
- **dotenv** - Environment variables

### Frontend Dependencies

- **react** - UI library
- **vite** - Build tool
- **typescript** - Type safety
- **tailwindcss** - Styling
- **zustand** - State management
- **react-router-dom** - Routing
- **axios** - HTTP client
- **react-hot-toast** - Notifications
- **lucide-react** - Icons

## 🎨 Recommended VS Code Extensions

The setup script can automatically install these:

1. **Prisma** (Prisma.prisma) - Prisma syntax highlighting
2. **ESLint** (dbaeumer.vscode-eslint) - Code linting
3. **Prettier** (esbenp.prettier-vscode) - Code formatting
4. **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss) - Tailwind autocomplete
5. **TypeScript Extension Pack** (loiane.ts-extension-pack) - TypeScript tools

## 🏃 Running the Application

### Start Backend Server

```bash
cd Backend
npm run dev
```

Backend will run on: http://localhost:5000

### Start Frontend Server

```bash
cd Frontend
npm run dev
```

Frontend will run on: http://localhost:3000

### Run Both Servers Simultaneously

**Windows (PowerShell):**
```powershell
# Terminal 1
cd Backend; npm run dev

# Terminal 2 (new terminal)
cd Frontend; npm run dev
```

**Linux/macOS:**
```bash
# Terminal 1
cd Backend && npm run dev

# Terminal 2 (new terminal)
cd Frontend && npm run dev
```

## 🗄️ Database Commands

### Generate Prisma Client
```bash
cd Backend
npx prisma generate
```

### Run Migrations
```bash
cd Backend
npx prisma migrate deploy
```

### Create New Migration
```bash
cd Backend
npx prisma migrate dev --name your_migration_name
```

### Open Prisma Studio (Database GUI)
```bash
cd Backend
npx prisma studio
```

### Reset Database (⚠️ Deletes all data)
```bash
cd Backend
npx prisma migrate reset
```

## 👤 Default Admin Account

After running migrations, you can create an admin account:

1. Sign up as a regular user at http://localhost:3000/signup
2. Manually update the user's role in the database using Prisma Studio
3. Or use the seeding script (if available)

## 🔍 Troubleshooting

### "Command not found: node"
- Install Node.js from https://nodejs.org/

### "Cannot find module 'prisma'"
- Run `npm install` in the Backend directory

### "Database connection error"
- Check your `DATABASE_URL` in the `.env` file
- Ensure your database is running and accessible

### "Port 5000 already in use"
- Change `PORT` in Backend `.env` file
- Or kill the process using port 5000

### "CORS error in browser"
- Ensure `FRONTEND_URL` in Backend `.env` matches your frontend URL
- Check that both servers are running

### PowerShell Execution Policy Error
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📚 Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🌐 API Endpoints

After setup, your API will be available at:

- Health Check: http://localhost:5000/health
- API Base: http://localhost:5000/api

Key endpoints:
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/books` - Get all books
- `GET /api/loans` - Get user loans
- And more...

## 🎯 Next Steps

1. ✅ Run the setup script
2. ✅ Configure `.env` file
3. ✅ Start both servers
4. ✅ Access http://localhost:3000
5. ✅ Create an account and explore!

## 📞 Need Help?

If you encounter issues:

1. Check this guide's Troubleshooting section
2. Verify all prerequisites are installed
3. Ensure `.env` file is configured correctly
4. Check terminal output for specific error messages

## 🎉 Success!

If everything is working, you should see:

- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ Database connected
- ✅ No errors in terminal

Happy coding! 🚀
