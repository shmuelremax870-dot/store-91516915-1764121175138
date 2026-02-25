/**
 * Prisma Client Singleton
 *
 * Provides a single shared PrismaClient instance across the application.
 * In development, the client is stored on `globalThis` to prevent Next.js
 * hot-reload from creating multiple database connections.
 *
 * To use with a real database:
 * 1. Set DATABASE_URL in .env
 * 2. Run: npx prisma generate
 * 3. Change import below to: import { PrismaClient } from './generated/prisma'
 */

// Stub for build - replace with real Prisma import when DB is connected
let PrismaClientConstructor: any;
try {
  PrismaClientConstructor = require('./generated/prisma').PrismaClient;
} catch {
  // Prisma client not generated yet - use stub
  PrismaClientConstructor = class StubPrismaClient {
    constructor(_opts?: any) {}
  };
}

const globalForPrisma = globalThis as unknown as { prisma: any };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClientConstructor({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
