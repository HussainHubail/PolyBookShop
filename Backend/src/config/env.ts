// FILE: src/config/env.ts
// Environment configuration with validation

import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  API_PREFIX: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER: string;
  SMTP_PASSWORD: string;
  EMAIL_FROM: string;
  FRONTEND_URL: string;
  VERIFICATION_TOKEN_EXPIRY_HOURS: number;
  DEFAULT_LOAN_PERIOD_DAYS: number;
  DEFAULT_MAX_BORROWED_BOOKS: number;
  FINE_PER_DAY: number;
  RESERVATION_EXPIRY_DAYS: number;
  BACKUP_DIRECTORY: string;
  BACKUP_SCHEDULE_CRON: string;
  CORS_ORIGIN: string;
  LOG_LEVEL: string;
}

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
};

const getEnvBoolean = (key: string, defaultValue: boolean = false): boolean => {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

export const env: EnvConfig = {
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 5000),
  API_PREFIX: getEnv('API_PREFIX', '/api'),
  DATABASE_URL: getEnv('DATABASE_URL'),
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '7d'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN', '30d'),
  SMTP_HOST: getEnv('SMTP_HOST'),
  SMTP_PORT: getEnvNumber('SMTP_PORT', 587),
  SMTP_SECURE: getEnvBoolean('SMTP_SECURE', false),
  SMTP_USER: getEnv('SMTP_USER'),
  SMTP_PASSWORD: getEnv('SMTP_PASSWORD'),
  EMAIL_FROM: getEnv('EMAIL_FROM'),
  FRONTEND_URL: getEnv('FRONTEND_URL', 'http://localhost:3000'),
  VERIFICATION_TOKEN_EXPIRY_HOURS: getEnvNumber('VERIFICATION_TOKEN_EXPIRY_HOURS', 24),
  DEFAULT_LOAN_PERIOD_DAYS: getEnvNumber('DEFAULT_LOAN_PERIOD_DAYS', 14),
  DEFAULT_MAX_BORROWED_BOOKS: getEnvNumber('DEFAULT_MAX_BORROWED_BOOKS', 5),
  FINE_PER_DAY: getEnvNumber('FINE_PER_DAY', 0.5),
  RESERVATION_EXPIRY_DAYS: getEnvNumber('RESERVATION_EXPIRY_DAYS', 3),
  BACKUP_DIRECTORY: getEnv('BACKUP_DIRECTORY', './backups'),
  BACKUP_SCHEDULE_CRON: getEnv('BACKUP_SCHEDULE_CRON', '0 2 * * *'),
  CORS_ORIGIN: getEnv('CORS_ORIGIN', 'http://localhost:3000'),
  LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),
};

export default env;
