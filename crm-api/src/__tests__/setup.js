import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const TEST_DB = './prisma/test.db';
process.env.DATABASE_URL = `file:${TEST_DB}`;
process.env.JWT_SECRET = 'test-secret-key-for-vitest-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

let prisma;

export async function setupTestDb() {
  if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  execSync('npx prisma db push --skip-generate', { stdio: 'pipe' });

  prisma = new PrismaClient({ datasources: { db: { url: `file:${TEST_DB}` } } });
  await prisma.$connect();

  const hash = await bcrypt.hash('testpass123', 10);
  await prisma.user.create({
    data: { email: 'test@ndembo.com', password: hash, nom: 'Test User', role: 'admin' },
  });

  await prisma.client.create({
    data: { ref: 'CLI-TEST-001', nom: 'Club Test FC', type: 'Club', email: 'test@club.fr', ville: 'Paris', pays: 'France' },
  });

  await prisma.$disconnect();
}

export async function teardownTestDb() {
  if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
}
