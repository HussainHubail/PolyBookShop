// FILE: src/types/index.ts
// TypeScript interfaces

export interface User {
  id: number;
  username: string;
  email: string;
  loginId: string;
  accountType: 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
  roles: string[];
  isActive: boolean;
  member?: Member;
}

export interface Member {
  id: number;
  userId: number;
  studentOrStaffId: string;
  maxBorrowedBooks: number;
  department?: string;
  phoneNumber?: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publishedYear?: number;
  category: string;
  publisher?: string;
  description?: string;
  coverImageUrl?: string;
  totalCopies: number;
  availableCopies: number;
}

export interface BookCopy {
  id: number;
  bookId: number;
  barcode: string;
  rfidTag?: string;
  condition: string;
  status: string;
  location?: string;
  book?: Book;
}

export interface Loan {
  id: number;
  memberId: number;
  bookCopyId: number;
  borrowDatetime: string;
  dueDatetime: string;
  returnDatetime?: string;
  status: string;
  renewalCount: number;
  member?: {
    user: User;
  };
  bookCopy?: {
    book: Book;
    barcode: string;
  };
}

export interface AuthResponse {
  success: boolean;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

export interface ApiSuccess<T = any> {
  success: true;
  data?: T;
  message?: string;
}
