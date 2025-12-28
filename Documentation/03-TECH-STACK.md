# 🛠️ Technology Stack

## Backend Architecture

### Core Technologies
- **Runtime**: Node.js 20+
  - JavaScript runtime built on Chrome's V8 engine
  - Supports modern ES6+ features
  - Excellent performance for I/O operations

- **Framework**: Express.js 4
  - Minimal and flexible Node.js web application framework
  - Robust routing and middleware support
  - Large ecosystem of plugins

- **Language**: TypeScript 5.3
  - Static type checking for JavaScript
  - Enhanced IDE support and autocompletion
  - Improved code quality and maintainability

### Database Layer
- **Database**: PostgreSQL 15+
  - Advanced open-source relational database
  - ACID compliance for data integrity
  - Powerful querying capabilities
  - Hosted on **Neon** (AWS ap-southeast-1)

- **ORM**: Prisma 5.7
  - Modern database toolkit
  - Type-safe database client
  - Automatic migrations
  - Intuitive data modeling

### Security & Authentication
- **Authentication**: jsonwebtoken (JWT)
  - Stateless authentication mechanism
  - Token-based authorization
  - 7-day expiration (configurable)

- **Password Hashing**: bcrypt
  - Industry-standard password hashing
  - Salt rounds: 10
  - Protection against rainbow table attacks

- **Rate Limiting**: express-rate-limit 7.4.1
  - **Login**: 5 attempts per 15 minutes
  - **Signup**: 3 attempts per hour
  - **Verification**: 3 attempts per hour
  - Protection against brute force attacks

### Email & Notifications
- **Email Service**: Nodemailer
  - SMTP email sending
  - Support for Gmail, Outlook, custom SMTP
  - HTML email templates
  - Attachment support

### Validation & Logging
- **Validation**: express-validator
  - Request data validation
  - Sanitization
  - Custom validators

- **Logging**: Winston
  - Comprehensive logging framework
  - Multiple log levels (info, warn, error)
  - File and console transports
  - Integration with SYSTEM_LOG table

### Automation & Scheduling
- **Task Scheduler**: node-cron
  - **Due Date Reminders**: Daily at 9:00 AM
  - **Overdue Warnings**: Daily at 10:00 AM
  - **Auto-place Holds**: Daily at 11:00 AM (7-day grace)
  - **Auto-charge Fines**: Daily at 12:00 PM

### Middleware
- **CORS**: express CORS middleware
  - Cross-origin resource sharing
  - Configured for frontend origin
  - Credential support

- **Body Parser**: express.json()
  - JSON request body parsing
  - URL-encoded data support

---

## Frontend Architecture

### Core Technologies
- **Framework**: React 18.3
  - Modern UI library
  - Component-based architecture
  - Virtual DOM for performance
  - Hooks for state management

- **Language**: TypeScript 5.5
  - Type safety for React components
  - Props validation
  - Enhanced developer experience

- **Build Tool**: Vite 5.4
  - Lightning-fast HMR (Hot Module Replacement)
  - Optimized production builds
  - Native ES modules support
  - 2-3x faster than webpack

### Styling & UI
- **CSS Framework**: Tailwind CSS 3.4
  - Utility-first CSS framework
  - Custom GPU acceleration
  - Responsive design utilities
  - Dark mode support
  - Custom color palette

- **Icons**: Lucide React
  - Beautiful, customizable icons
  - 1000+ icons available
  - Tree-shakeable
  - Consistent design

### State Management
- **Global State**: Zustand
  - Lightweight (1kb)
  - Simple API
  - No boilerplate
  - TypeScript support
  - LocalStorage persistence

### Routing
- **Router**: React Router DOM v6
  - Declarative routing
  - Nested routes
  - Protected routes
  - Route parameters
  - Navigation guards

### Data Fetching & HTTP
- **HTTP Client**: Axios
  - Promise-based HTTP client
  - Request/response interceptors
  - Automatic JSON transformation
  - Error handling

### User Experience
- **Notifications**: react-hot-toast 2.4.1
  - Elegant toast notifications
  - Customizable styling
  - Success/error/loading states
  - Auto-dismiss
  - Stacking support

- **Date Utilities**: date-fns
  - Modern date utility library
  - Lightweight alternative to moment.js
  - Immutable & pure functions
  - Timezone support

---

## Database & Infrastructure

### Database Management
- **RDBMS**: PostgreSQL 15+
  - 12 essential tables
  - Optimized indexes for common queries
  - Foreign key constraints
  - Cascade operations

- **Cloud Hosting**: Neon
  - Serverless PostgreSQL
  - AWS ap-southeast-1 region
  - Automatic scaling
  - Built-in connection pooling
  - Free tier available

### Schema Management
- **Migrations**: Prisma Migrate
  - Version-controlled schema changes
  - Automatic migration generation
  - Rollback support
  - Migration history

### Data Integrity
- **Indexing Strategy**:
  - Primary keys on all tables
  - Foreign key indexes
  - Unique constraints on email, loginId
  - Composite indexes for common queries

- **Audit Trail**: SYSTEM_LOG table
  - Tracks all critical operations
  - User actions logging
  - IP address tracking
  - Timestamp tracking
  - Log levels (INFO, WARN, ERROR)

### Connection Management
- **Prisma Connection Pooling**:
  - Efficient database connections
  - Automatic connection reuse
  - Prevents connection exhaustion
  - Configurable pool size

---

## Development Tools

### Package Management
- **Package Manager**: npm
  - Node package manager
  - Lock file for consistent installs
  - Script automation

### Code Quality
- **Linting**: ESLint
  - Code quality enforcement
  - Style consistency
  - Best practices

- **Formatting**: Prettier
  - Automatic code formatting
  - Consistent code style
  - Integration with ESLint

### TypeScript
- **Compilation**: tsc
  - TypeScript compiler
  - Type checking
  - ES module output

### Development Servers
- **Backend**: ts-node-dev
  - TypeScript execution
  - Automatic restart on file changes
  - Fast compilation

- **Frontend**: Vite HMR
  - Instant hot module replacement
  - Sub-second reload times
  - Optimized build output

---

## Performance Optimizations

### Backend
- **Database Query Optimization**:
  - Selective field retrieval
  - Eager loading with `include`
  - Pagination for large datasets
  - Indexed queries

- **Caching Strategy**:
  - JWT token caching
  - Rate limiter memory store
  - Prisma query result caching

### Frontend
- **Build Optimizations**:
  - Code splitting
  - Tree shaking
  - Minification
  - Compression

- **Runtime Optimizations**:
  - Debounced search (500ms)
  - Virtual scrolling for large lists
  - Lazy loading for routes
  - GPU-accelerated CSS

- **Asset Optimization**:
  - SVG logo (scalable, small)
  - Icon tree-shaking
  - Image lazy loading

---

## Security Features

### Application Security
- **Input Validation**: All user inputs validated
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **XSS Protection**: React's built-in escaping
- **CSRF Protection**: Token-based authentication
- **Rate Limiting**: Multiple rate limiters for different endpoints
- **Password Security**: bcrypt with salt

### Network Security
- **HTTPS Ready**: SSL/TLS support
- **CORS Configuration**: Whitelist-based origin control
- **Security Headers**: Standard security headers
- **Environment Variables**: Sensitive data in .env files

### Data Security
- **Encryption**: Passwords hashed with bcrypt
- **JWT Tokens**: Signed with secret key
- **Database Credentials**: Environment variable storage
- **Audit Logging**: Complete activity tracking
