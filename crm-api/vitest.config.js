import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DB_ABS = path.join(__dirname, 'prisma', 'test.db');

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: `file:${TEST_DB_ABS}`,
      JWT_SECRET: 'test-secret-key-for-vitest-only-64chars-minimum-length-here',
      JWT_EXPIRES_IN: '1h',
      NODE_ENV: 'test',
    },
    globalSetup: ['./src/__tests__/global-setup.js'],
    include: ['src/__tests__/**/*.test.js'],
    sequence: { concurrent: false },
  },
});
