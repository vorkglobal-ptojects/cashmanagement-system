import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Compute absolute path to the SQLite database with forward slashes (safe on Windows)
const prismaDbPath = path.resolve(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/');
const rootDbPath = path.resolve(process.cwd(), 'dev.db').replace(/\\/g, '/');

// Ensure database file exists in both locations so any tool can access it
try {
  if (fs.existsSync(prismaDbPath) && !fs.existsSync(rootDbPath)) {
    fs.copyFileSync(prismaDbPath, rootDbPath);
  } else if (fs.existsSync(rootDbPath) && !fs.existsSync(prismaDbPath)) {
    fs.copyFileSync(rootDbPath, prismaDbPath);
  }
} catch {
  // Pass through
}

// Target the existing database file with an unambiguous absolute file URL
const targetDbFile = fs.existsSync(prismaDbPath) ? prismaDbPath : rootDbPath;
const absoluteDbUrl = `file:${targetDbFile}`;

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    datasources: {
      db: {
        url: absoluteDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
