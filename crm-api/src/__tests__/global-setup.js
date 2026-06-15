import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Absolute path — robust regardless of CWD
const TEST_DB_ABS = path.join(__dirname, '../../prisma/test.db');
const DATABASE_URL = `file:${TEST_DB_ABS}`;

export async function setup() {
  if (existsSync(TEST_DB_ABS)) unlinkSync(TEST_DB_ABS);

  execSync('npx prisma db push --skip-generate', {
    stdio: 'pipe',
    cwd: path.join(__dirname, '../../'),
    env: { ...process.env, DATABASE_URL },
  });

  const prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });

  const hash = await bcrypt.hash('testpass123', 10);
  await prisma.user.upsert({
    where: { email: 'test@ndembo.com' },
    update: {},
    create: { email: 'test@ndembo.com', password: hash, nom: 'Test User', role: 'admin' },
  });
  await prisma.client.upsert({
    where: { ref: 'CLI-TEST-001' },
    update: {},
    create: { ref: 'CLI-TEST-001', nom: 'Club Test FC', type: 'Club', email: 'test@club.fr', ville: 'Paris', pays: 'France' },
  });

  await prisma.$disconnect();
}

export async function teardown() {
  if (existsSync(TEST_DB_ABS)) unlinkSync(TEST_DB_ABS);
}
