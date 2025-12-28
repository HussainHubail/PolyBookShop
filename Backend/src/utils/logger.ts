// FILE: src/utils/logger.ts
// System logging utility for audit trail

import prisma from '../config/database';

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

export enum LogAction {
  // Authentication
  SIGNUP = 'SIGNUP',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  
  // Users & Roles
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  ASSIGN_ROLE = 'ASSIGN_ROLE',
  REMOVE_ROLE = 'REMOVE_ROLE',
  
  // Books & Copies
  CREATE_BOOK = 'CREATE_BOOK',
  UPDATE_BOOK = 'UPDATE_BOOK',
  DELETE_BOOK = 'DELETE_BOOK',
  CREATE_BOOK_COPY = 'CREATE_BOOK_COPY',
  UPDATE_BOOK_COPY = 'UPDATE_BOOK_COPY',
  DELETE_BOOK_COPY = 'DELETE_BOOK_COPY',
  
  // Loans
  CREATE_LOAN = 'CREATE_LOAN',
  UPDATE_LOAN = 'UPDATE_LOAN',
  RETURN_LOAN = 'RETURN_LOAN',
  MARK_OVERDUE = 'MARK_OVERDUE',
  RENEW_LOAN = 'RENEW_LOAN',
  
  // Reservations
  CREATE_RESERVATION = 'CREATE_RESERVATION',
  UPDATE_RESERVATION = 'UPDATE_RESERVATION',
  CANCEL_RESERVATION = 'CANCEL_RESERVATION',
  FULFILL_RESERVATION = 'FULFILL_RESERVATION',
  EXPIRE_RESERVATION = 'EXPIRE_RESERVATION',
  
  // Fines
  CREATE_FINE = 'CREATE_FINE',
  PAY_FINE = 'PAY_FINE',
  WAIVE_FINE = 'WAIVE_FINE',
  
  // Holds
  PLACE_HOLD = 'PLACE_HOLD',
  REMOVE_HOLD = 'REMOVE_HOLD',
  
  // Notifications
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  CREATE_NOTIFICATION = 'CREATE_NOTIFICATION',
  SEND_DUE_REMINDERS = 'SEND_DUE_REMINDERS',
  SEND_OVERDUE_WARNINGS = 'SEND_OVERDUE_WARNINGS',
  ADMIN_SEND_NOTIFICATION = 'ADMIN_SEND_NOTIFICATION',
  
  // Additional actions
  CHARGE_FINE = 'CHARGE_FINE',
  UPLOAD_BOOK_PDF = 'UPLOAD_BOOK_PDF',
  
  // Backups
  BACKUP_STARTED = 'BACKUP_STARTED',
  BACKUP_COMPLETED = 'BACKUP_COMPLETED',
  BACKUP_FAILED = 'BACKUP_FAILED',
  
  // System
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  SYSTEM_STARTUP = 'SYSTEM_STARTUP',
  SYSTEM_SHUTDOWN = 'SYSTEM_SHUTDOWN',
}

interface LogParams {
  userId?: number;
  backupJobId?: number;
  level: LogLevel;
  action: LogAction;
  details: string | object;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Central logging function - writes to SYSTEM_LOG table
 * PERSISTENCE REQUIREMENT: All important operations must be logged here
 */
export async function log(params: LogParams): Promise<void> {
  try {
    const detailsString = typeof params.details === 'object' 
      ? JSON.stringify(params.details) 
      : params.details;

    await prisma.systemLog.create({
      data: {
        userId: params.userId,
        level: params.level,
        action: params.action,
        details: detailsString,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });

    // Log to console only for errors and warnings in production, or if LOG_LEVEL is debug
    const shouldLogToConsole = 
      process.env.NODE_ENV === 'development' ||
      params.level === LogLevel.ERROR ||
      params.level === LogLevel.WARN ||
      process.env.LOG_LEVEL === 'debug';
    
    if (shouldLogToConsole) {
      const logPrefix = `[${params.level}] ${params.action}:`;
      if (params.level === LogLevel.ERROR) {
        console.error(logPrefix, params.details);
      } else if (params.level === LogLevel.WARN) {
        console.warn(logPrefix, params.details);
      } else {
        console.log(logPrefix, params.details);
      }
    }
  } catch (error) {
    // Fallback: if database logging fails, at least log to console
    console.error('Failed to write to SYSTEM_LOG:', error);
    console.error('Original log:', params);
  }
}

/**
 * Convenience functions for different log levels
 */
export const logger = {
  info: (action: LogAction, details: string | object, userId?: number) => 
    log({ level: LogLevel.INFO, action, details, userId }),
  
  warn: (action: LogAction, details: string | object, userId?: number) => 
    log({ level: LogLevel.WARN, action, details, userId }),
  
  error: (action: LogAction, details: string | object, userId?: number) => 
    log({ level: LogLevel.ERROR, action, details, userId }),
  
  debug: (action: LogAction, details: string | object, userId?: number) => 
    log({ level: LogLevel.DEBUG, action, details, userId }),
};

export default logger;
