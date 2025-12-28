# 📡 API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Health Check

```http
GET /health

Response: 200 OK
{
  "status": "ok",
  "timestamp": "2025-12-06T12:00:00.000Z"
}
```

---

## Authentication Endpoints

### Member Signup

Register a new member account with email verification.

```http
POST /api/auth/member/signup
Content-Type: application/json

{
  "username": "John Doe",
  "email": "john@university.edu",
  "password": "SecurePass@123",
  "department": "Computer Science",
  "phoneNumber": "+1234567890"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "loginId": "MEM-A3B7C2",
  "message": "Account created successfully! Your member ID is MEM-A3B7C2. Please check your email to verify your account."
}
```

**Validation Rules:**
- `username`: Required, 3-100 characters
- `email`: Required, valid email format, unique
- `password`: Required, min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- `department`: Required
- `phoneNumber`: Optional, valid phone format

---

### Email Verification

Verify member email address using token from email.

```http
GET /api/auth/verify-email?token=<verification-token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now log in."
}
```

**Rate Limited**: 3 attempts per hour per IP

---

### Login (Three-Way)

Authenticate user with loginId, password, and account type.

```http
POST /api/auth/login
Content-Type: application/json

{
  "loginId": "MEM-A3B7C2",
  "password": "SecurePass@123",
  "accountType": "MEMBER"
}
```

**Account Types**: `ADMIN`, `LIBRARIAN`, `MEMBER`

**Response: 200 OK**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "John Doe",
    "email": "john@university.edu",
    "loginId": "MEM-A3B7C2",
    "accountType": "MEMBER",
    "roles": ["MEMBER"],
    "member": {
      "id": 1,
      "department": "Computer Science",
      "phoneNumber": "+1234567890"
    }
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Rate Limited**: 5 attempts per 15 minutes per IP

---

### Get Current User

Get authenticated user's profile.

```http
GET /api/auth/me
Authorization: Bearer <access-token>
```

**Response: 200 OK**
```json
{
  "id": 1,
  "username": "John Doe",
  "email": "john@university.edu",
  "loginId": "MEM-A3B7C2",
  "accountType": "MEMBER",
  "roles": ["MEMBER"]
}
```

---

## Book Endpoints

### Search Books (Public)

Search and filter books with pagination.

```http
GET /api/books?search=python&category=Programming&bookType=physical&page=1&limit=20
```

**Query Parameters:**
- `search` (optional): Search term for title, author, ISBN, category, description
- `category` (optional): Filter by category
- `bookType` (optional): `physical` or `online`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response: 200 OK**
```json
{
  "books": [
    {
      "id": 1,
      "title": "Introduction to Python",
      "author": "John Smith",
      "isbn": "978-1234567890",
      "category": "Programming",
      "publishedYear": 2023,
      "description": "Comprehensive Python guide",
      "bookType": "PHYSICAL",
      "totalCopies": 5,
      "availableCopies": 3
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### Get Book by ID

Get detailed information about a specific book.

```http
GET /api/books/:id
```

**Response: 200 OK**
```json
{
  "id": 1,
  "title": "Introduction to Python",
  "author": "John Smith",
  "isbn": "978-1234567890",
  "category": "Programming",
  "publishedYear": 2023,
  "description": "Comprehensive Python guide for beginners",
  "bookType": "PHYSICAL",
  "copies": [
    {
      "id": 1,
      "barcode": "BC-A3B7C2D4E5F6",
      "status": "AVAILABLE",
      "condition": "NEW",
      "location": "Shelf A-12"
    }
  ]
}
```

---

### Create Book (Librarian/Admin)

Add a new book to the catalog.

```http
POST /api/books
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "Introduction to Python",
  "author": "John Smith",
  "isbn": "978-1234567890",
  "category": "Programming",
  "publishedYear": 2023,
  "description": "Comprehensive Python guide",
  "bookType": "PHYSICAL"
}
```

**Response: 201 Created**
```json
{
  "id": 1,
  "title": "Introduction to Python",
  "message": "Book created successfully"
}
```

---

### Create Book Copy (Librarian/Admin)

Add a physical copy of a book.

```http
POST /api/book-copies
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "bookId": 1,
  "condition": "NEW",
  "location": "Shelf A-12"
}
```

**Response: 201 Created**
```json
{
  "id": 1,
  "barcode": "BC-A3B7C2D4E5F6",
  "status": "AVAILABLE",
  "condition": "NEW",
  "location": "Shelf A-12"
}
```

---

## Loan Endpoints

### Create Loan (Librarian/Admin)

Process a book checkout for a member.

```http
POST /api/loans
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "memberId": 1,
  "bookCopyId": 5,
  "durationDays": 14
}
```

**⚠️ Important**: Automatically sends loan confirmation email to member with borrow and return dates.

**Response: 201 Created**
```json
{
  "id": 42,
  "memberId": 1,
  "bookCopyId": 5,
  "borrowDate": "2025-12-06T10:30:00Z",
  "dueDate": "2025-12-20T10:30:00Z",
  "status": "ONGOING",
  "message": "Loan created successfully. Confirmation email sent to member."
}
```

---

### Return Book (Librarian/Admin)

Process a book return and calculate fines if overdue.

```http
POST /api/loans/:id/return
Authorization: Bearer <access-token>
```

**Response: 200 OK (On-time return)**
```json
{
  "success": true,
  "message": "Book returned successfully",
  "loan": {
    "id": 42,
    "status": "RETURNED",
    "returnDate": "2025-12-18T14:30:00Z"
  }
}
```

**Response: 200 OK (Overdue return)**
```json
{
  "success": true,
  "message": "Book returned successfully. Fine charged for 3 days overdue.",
  "loan": {
    "id": 42,
    "status": "RETURNED",
    "returnDate": "2025-12-23T14:30:00Z"
  },
  "fine": {
    "id": 5,
    "amount": 1.50,
    "reason": "Overdue return: 3 days late",
    "status": "UNPAID"
  }
}
```

---

### Renew Loan

Extend loan period by default duration.

```http
POST /api/loans/:id/renew
Authorization: Bearer <access-token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Loan renewed successfully",
  "loan": {
    "id": 42,
    "oldDueDate": "2025-12-20T10:30:00Z",
    "newDueDate": "2025-01-03T10:30:00Z"
  }
}
```

**Error Response: 400 Bad Request (Hold exists)**
```json
{
  "error": "Cannot renew: Book has active holds"
}
```

---

### Get My Loans (Member)

Get authenticated member's loans.

```http
GET /api/loans/my-loans?status=ongoing
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `status` (optional): `ongoing`, `returned`, `overdue`, `all`

**Response: 200 OK**
```json
{
  "loans": [
    {
      "id": 42,
      "borrowDate": "2025-12-06T10:30:00Z",
      "dueDate": "2025-12-20T10:30:00Z",
      "status": "ONGOING",
      "book": {
        "title": "Introduction to Python",
        "author": "John Smith"
      },
      "copy": {
        "barcode": "BC-A3B7C2D4E5F6"
      }
    }
  ]
}
```

---

### Get All Loans (Librarian/Admin)

Get all loans with filtering and pagination.

```http
GET /api/loans?status=overdue&page=1&limit=20
Authorization: Bearer <access-token>
```

**Response: 200 OK**
```json
{
  "loans": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

## Hold Endpoints

### Place Hold

Reserve a book when all copies are on loan.

```http
POST /api/holds
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "bookId": 1
}
```

**Response: 201 Created**
```json
{
  "id": 10,
  "bookId": 1,
  "memberId": 1,
  "status": "ACTIVE",
  "queuePosition": 3,
  "message": "Hold placed successfully. You are #3 in the queue."
}
```

---

### Get My Holds

Get authenticated member's holds.

```http
GET /api/holds/my-holds
Authorization: Bearer <access-token>
```

**Response: 200 OK**
```json
{
  "holds": [
    {
      "id": 10,
      "status": "ACTIVE",
      "queuePosition": 2,
      "createdAt": "2025-12-06T10:00:00Z",
      "book": {
        "title": "Introduction to Python",
        "author": "John Smith"
      }
    }
  ]
}
```

---

### Cancel Hold

Remove an active hold.

```http
DELETE /api/holds/:id
Authorization: Bearer <access-token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Hold cancelled successfully"
}
```

---

## Fine Endpoints

### Get My Fines

Get authenticated member's fines.

```http
GET /api/fines/my-fines?status=unpaid
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `status` (optional): `unpaid`, `paid`, `all`

**Response: 200 OK**
```json
{
  "fines": [
    {
      "id": 5,
      "amount": 1.50,
      "reason": "Overdue return: 3 days late",
      "status": "UNPAID",
      "createdAt": "2025-12-23T14:30:00Z",
      "loan": {
        "book": {
          "title": "Introduction to Python"
        }
      }
    }
  ],
  "totalUnpaid": 1.50
}
```

---

### Pay Fine

Process fine payment.

```http
POST /api/fines/:id/pay
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "paymentMethod": "CASH"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Fine paid successfully",
  "fine": {
    "id": 5,
    "status": "PAID",
    "paidAt": "2025-12-24T10:00:00Z"
  }
}
```

---

## Notification Endpoints

### Get My Notifications

Get authenticated user's notifications.

```http
GET /api/notifications?unreadOnly=true
Authorization: Bearer <access-token>
```

**Response: 200 OK**
```json
{
  "notifications": [
    {
      "id": 15,
      "type": "LOAN_CONFIRMATION",
      "title": "Book Borrowed Successfully",
      "message": "You have borrowed 'Introduction to Python'. Due date: Dec 20, 2025",
      "read": false,
      "createdAt": "2025-12-06T10:30:00Z"
    }
  ]
}
```

---

### Mark Notification as Read

Mark a notification as read.

```http
PUT /api/notifications/:id/read
Authorization: Bearer <access-token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Something went wrong"
}
```
