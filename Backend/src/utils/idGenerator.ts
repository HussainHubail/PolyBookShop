// FILE: src/utils/idGenerator.ts
// Generate unique login IDs for different account types

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate unique member login ID
 * Format: MEM-XXXXXX (e.g., MEM-A3B7C2)
 */
export function generateMemberLoginId(): string {
  const randomPart = uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase();
  return `MEM-${randomPart}`;
}

/**
 * Generate unique admin login ID
 * Format: ADM-XXXXXX (e.g., ADM-X9Y2Z5)
 */
export function generateAdminLoginId(): string {
  const randomPart = uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase();
  return `ADM-${randomPart}`;
}

/**
 * Generate unique librarian login ID
 * Format: LIB-XXXXXX (e.g., LIB-P4Q8R1)
 */
export function generateLibrarianLoginId(): string {
  const randomPart = uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase();
  return `LIB-${randomPart}`;
}

/**
 * Generate login ID based on account type
 */
export function generateLoginId(accountType: 'ADMIN' | 'LIBRARIAN' | 'MEMBER'): string {
  switch (accountType) {
    case 'ADMIN':
      return generateAdminLoginId();
    case 'LIBRARIAN':
      return generateLibrarianLoginId();
    case 'MEMBER':
      return generateMemberLoginId();
    default:
      throw new Error(`Invalid account type: ${accountType}`);
  }
}

/**
 * Generate student/staff ID for members
 * Format: STU-XXXXXXXX or STF-XXXXXXXX
 */
export function generateStudentStaffId(type: 'STUDENT' | 'STAFF' = 'STUDENT'): string {
  const prefix = type === 'STUDENT' ? 'STU' : 'STF';
  const randomPart = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  return `${prefix}-${randomPart}`;
}

/**
 * Generate book barcode
 * Format: BC-XXXXXXXXXXXX
 */
export function generateBookBarcode(): string {
  const randomPart = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();
  return `BC-${randomPart}`;
}

/**
 * Generate RFID tag
 * Format: RFID-XXXXXXXXXXXXXXXX
 */
export function generateRFIDTag(): string {
  const randomPart = uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();
  return `RFID-${randomPart}`;
}
