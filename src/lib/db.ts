import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Ensure SQLite database file is available regardless of CWD resolution
try {
  const rootDb = path.resolve(process.cwd(), 'dev.db');
  const prismaDb = path.resolve(process.cwd(), 'prisma', 'dev.db');
  if (fs.existsSync(prismaDb) && !fs.existsSync(rootDb)) {
    fs.copyFileSync(prismaDb, rootDb);
  } else if (fs.existsSync(rootDb) && !fs.existsSync(prismaDb)) {
    fs.copyFileSync(rootDb, prismaDb);
  }
} catch {
  // Pass through
}

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
