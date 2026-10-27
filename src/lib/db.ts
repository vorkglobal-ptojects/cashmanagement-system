import fs from 'fs';
import path from 'path';
import os from 'os';
import { PrismaClient } from '@prisma/client';

function setupDatabase(): string {
  // Check if running inside Vercel or AWS Lambda serverless runtime
  const isServerless =
    process.env.VERCEL === '1' ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.VERCEL_ENV);

  if (isServerless) {
    const tmpDbPath = path.join(os.tmpdir(), 'cash_management.db').replace(/\\/g, '/');

    // In serverless environments, the filesystem outside /tmp is read-only.
    // SQLite requires a writable file and directory for journal / WAL / locking.
    if (!fs.existsSync(tmpDbPath)) {
      const candidatePaths = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.resolve(__dirname, '..', '..', '..', 'prisma', 'dev.db'),
        path.resolve(__dirname, '..', '..', 'prisma', 'dev.db'),
        path.resolve(__dirname, '..', 'prisma', 'dev.db'),
        path.resolve(__dirname, 'prisma', 'dev.db'),
        path.resolve(__dirname, 'dev.db'),
        path.resolve('/var/task', 'prisma', 'dev.db'),
        path.resolve('/var/task', 'dev.db'),
      ];

      let found = false;
      for (const candidate of candidatePaths) {
        try {
          if (fs.existsSync(candidate) && fs.statSync(candidate).size > 0) {
            fs.copyFileSync(candidate, tmpDbPath);
            found = true;
            break;
          }
        } catch {
          // Continue searching candidate paths
        }
      }

      if (!found) {
        console.warn('Serverless database template not found, creating new SQLite file at /tmp/cash_management.db');
      }
    }

    const tmpUrl = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = tmpUrl;
    return tmpUrl;
  }

  // Local / standard Node environment
  const prismaDbPath = path.resolve(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/');
  const rootDbPath = path.resolve(process.cwd(), 'dev.db').replace(/\\/g, '/');

  try {
    if (fs.existsSync(prismaDbPath) && !fs.existsSync(rootDbPath)) {
      fs.copyFileSync(prismaDbPath, rootDbPath);
    } else if (fs.existsSync(rootDbPath) && !fs.existsSync(prismaDbPath)) {
      fs.copyFileSync(rootDbPath, prismaDbPath);
    }
  } catch {
    // Pass through
  }

  const targetDbFile = fs.existsSync(prismaDbPath) ? prismaDbPath : rootDbPath;
  const dbUrl = `file:${targetDbFile}`;
  process.env.DATABASE_URL = dbUrl;
  return dbUrl;
}

const dbUrl = setupDatabase();

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;

