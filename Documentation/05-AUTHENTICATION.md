# 🔐 Authentication & Security

## Authentication System

### Three-Way Login Architecture

PolyBookShop implements a sophisticated three-tier authentication system with separate login flows for different user types.

```
┌─────────────────────────────────────────────────────────────┐
│              Login Selection Screen                         │
│                                                              │
│   ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│   │    ADMIN    │  │  LIBRARIAN   │  │    MEMBER    │      │
│   │  Dashboard  │  │  Operations  │  │ Self-Service │      │
│   └─────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
          │                  │                   │
          ▼                  ▼                   ▼
┌──────────────────────────────────────────────────────────────┐
│          Login with Unique ID + Password                     │
│          + Account Type Verification                         │
│                                                               │
│  • Validates credentials against database                    │
│  • Verifies account type matches selected role               │
│  • Checks email verification (Members only)                  │
│  • Rate limited (5 attempts per 15 minutes)                  │
└──────────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────┐
│          JWT Token Issued                                    │
│          • Access Token (7 days)                             │
│          • Role-Based Access Control                         │
│          • Stored in Frontend State (Zustand + localStorage) │
└──────────────────────────────────────────────────────────────┘
```

---

## Default Administrator Credentials

**⚠️ CRITICAL SECURITY NOTICE**

Change these passwords immediately after first login!

### Admin Account
- **Login ID**: `ADM-ADMIN1`
- **Password**: `Admin@123`
- **Account Type**: ADMIN
- **Capabilities**: Full system access, user management, analytics

### Librarian Account
- **Login ID**: `LIB-LIB001`
- **Password**: `Librarian@123`
- **Account Type**: LIBRARIAN
- **Capabilities**: Library operations, book management, loan processing

---

## Member Registration Flow

### Step-by-Step Process

#### 1. Signup Form Submission
User provides:
- Username (full name)
- Email address (must be unique)
- Password (must meet requirements)
- Department/Faculty
- Phone number (optional)

**Validation:**
- Email format check
- Password strength check
- Duplicate email detection
- Input sanitization

#### 2. Unique ID Generation
- System automatically generates unique Member Login ID
- Format: `MEM-XXXXXX` (6 random alphanumeric characters)
- Examples: `MEM-A3B7C2`, `MEM-K8P4M1`, `MEM-R7N2Q9`
- Uses cryptographically secure random generation
- Collision detection (regenerates if duplicate found)

#### 3. Verification Email Sent
Email contains:
- ✅ **Prominently displayed Login ID** (large, bold font)
- ✅ Verification link with secure token (expires in 24 hours)
- ✅ Step-by-step instructions for first login
- ✅ Welcome message with library policies
- ✅ Contact information for support

Example email:
```
Subject: Welcome to PolyBookShop - Verify Your Account

Hello [Username],

Your PolyBookShop account has been created successfully!

🔑 YOUR MEMBER LOGIN ID: MEM-A3B7C2
(Save this ID - you'll need it to log in)

Click the link below to verify your email address:
[Verification Link]

Once verified, you can log in at:
http://yourlibrary.com/login

Select "Member Login" and use:
- Login ID: MEM-A3B7C2
- Password: [Your chosen password]

This link expires in 24 hours.

Welcome to our library!
```

#### 4. Email Verification
- User clicks verification link
- System validates token:
  - Checks token exists
  - Verifies not expired
  - Confirms not already used
- Account status updated to `verified`
- Verification token invalidated
- Welcome screen displayed

#### 5. First Login
- User navigates to login page
- Selects "Member" account type
- Enters Member Login ID (from email) + password
- System validates:
  - Credentials match
  - Account is verified
  - Account not suspended
- JWT token issued
- Redirect to member dashboard

---

## Security Features

### Rate Limiting

Protection against brute force attacks with multiple rate limiters:

#### Login Endpoint (`POST /api/auth/login`)
- **Limit**: 5 attempts per 15 minutes per IP
- **Response**: HTTP 429 "Too many login attempts"
- **Headers**: RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
- **Reset**: Automatic after 15 minutes

#### Signup Endpoint (`POST /api/auth/member/signup`)
- **Limit**: 3 attempts per hour per IP
- **Response**: HTTP 429 "Too many signup attempts"
- **Purpose**: Prevent spam account creation

#### Verification Endpoint (`GET /api/auth/verify-email`)
- **Limit**: 3 attempts per hour per IP
- **Response**: HTTP 429 "Too many verification attempts"
- **Purpose**: Prevent token brute forcing

#### General API Limiter
- **Limit**: 100 requests per 15 minutes
- **Applies to**: All other endpoints
- **Purpose**: Prevent API abuse

#### Strict Limiter (Future use)
- **Limit**: 10 requests per hour
- **Purpose**: Highly sensitive operations

### Password Security

#### Hashing
- **Algorithm**: bcrypt
- **Salt Rounds**: 10
- **Work Factor**: 2^10 = 1024 iterations
- **Protection**: Against rainbow table and brute force attacks

#### Password Requirements
- **Minimum Length**: 8 characters
- **Uppercase**: At least 1 uppercase letter (A-Z)
- **Lowercase**: At least 1 lowercase letter (a-z)
- **Numbers**: At least 1 number (0-9)
- **Special Characters**: At least 1 special character (!@#$%^&*)

Example valid passwords:
- `SecurePass@123`
- `LibraryAdmin!2024`
- `Student#Pass99`

#### Password Storage
- Never stored in plain text
- Hashed before database insertion
- Salt automatically generated per password
- Irreversible hashing (cannot decrypt)

### JWT Token Management

#### Token Structure
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": 1,
    "loginId": "ADM-ADMIN1",
    "accountType": "ADMIN",
    "roles": ["ADMIN"],
    "iat": 1701878400,
    "exp": 1702483200
  },
  "signature": "..."
}
```

#### Token Configuration
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 7 days (configurable via `JWT_EXPIRES_IN`)
- **Secret**: Stored in environment variable (`JWT_SECRET`)
- **Issuer**: PolyBookShop API
- **Audience**: PolyBookShop Frontend

#### Token Storage (Frontend)
- **Primary**: Zustand state (in-memory)
- **Persistence**: localStorage
- **Key**: `polybookshop-auth-storage`
- **Format**: JSON serialized object
- **Security**: HttpOnly cookies alternative (future enhancement)

#### Token Validation
Every protected endpoint validates:
1. Token exists in Authorization header
2. Token format is valid
3. Token signature is valid
4. Token not expired
5. User still exists in database
6. User account not suspended

### Account Type Verification

#### Login ID Format Validation
- **Admin**: Must start with `ADM-`
- **Librarian**: Must start with `LIB-`
- **Member**: Must start with `MEM-`

#### Double Verification
Backend checks both:
1. Login ID format matches selected account type
2. User's role in database matches account type

#### Cross-Account Prevention
- Cannot login to Admin portal with Librarian credentials
- Cannot login to Member portal with Admin credentials
- Prevents privilege escalation attempts

---

## Role-Based Access Control (RBAC)

### Role Hierarchy

```
┌──────────────────────┐
│       ADMIN          │  Full system access
│  - All permissions   │
│  - User management   │
│  - System config     │
└──────────────────────┘
          │
          ├─────────────────────┐
          │                     │
┌─────────▼──────────┐  ┌──────▼─────────────┐
│    LIBRARIAN       │  │      MEMBER        │
│  - Book mgmt       │  │  - Browse books    │
│  - Loan processing │  │  - Borrow books    │
│  - Member view     │  │  - Manage loans    │
│  - Fine mgmt       │  │  - View fines      │
└────────────────────┘  └────────────────────┘
```

### Permission Matrix

| Feature | Member | Librarian | Admin |
|---------|--------|-----------|-------|
| Browse Books | ✅ | ✅ | ✅ |
| Borrow Books | ✅ | ❌ | ❌ |
| Add/Edit Books | ❌ | ✅ | ✅ |
| Process Loans | ❌ | ✅ | ✅ |
| View All Members | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| View System Logs | ❌ | ❌ | ✅ |
| System Configuration | ❌ | ❌ | ✅ |

---

## Additional Security Measures

### Input Validation
- **All inputs validated** on both frontend and backend
- **Sanitization**: Remove HTML tags, scripts
- **Type checking**: Ensure correct data types
- **Length limits**: Prevent buffer overflow
- **SQL Injection**: Prevented by Prisma ORM (parameterized queries)
- **XSS Protection**: React's built-in escaping

### CORS Configuration
```javascript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})
```

### HTTPS/SSL
- **Production**: Always use HTTPS
- **Certificate**: Let's Encrypt or commercial SSL
- **Redirect**: HTTP to HTTPS
- **HSTS**: HTTP Strict Transport Security header

### Session Security
- **Token Expiration**: Automatic logout after 7 days
- **Token Refresh**: Future enhancement
- **Concurrent Sessions**: Allowed (future: can restrict)
- **Logout**: Clears token from client storage

### Database Security
- **Connection String**: Stored in environment variables
- **SSL Mode**: Required for cloud databases (Neon)
- **Least Privilege**: Database user has only necessary permissions
- **Backup**: Regular automated backups
- **Audit Logs**: All critical operations logged

---

## Security Best Practices

### For Developers
1. ✅ Never commit `.env` files
2. ✅ Rotate JWT_SECRET regularly
3. ✅ Keep dependencies updated
4. ✅ Run security audits (`npm audit`)
5. ✅ Use HTTPS in production
6. ✅ Validate all user inputs
7. ✅ Log security events
8. ✅ Implement rate limiting

### For Administrators
1. ✅ Change default passwords immediately
2. ✅ Use strong, unique passwords
3. ✅ Enable email notifications
4. ✅ Review system logs regularly
5. ✅ Monitor for suspicious activity
6. ✅ Keep backups secure
7. ✅ Limit librarian accounts
8. ✅ Audit user permissions regularly

### For Users
1. ✅ Never share login credentials
2. ✅ Use strong passwords
3. ✅ Logout after use on shared computers
4. ✅ Report suspicious activity
5. ✅ Keep email address updated
6. ✅ Verify email links before clicking
