// Seed entry point - run with: npx prisma db seed
// This imports and runs the full seed.

import { runSeed } from './seeds/run-seed';

runSeed().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});