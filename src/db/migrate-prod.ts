/**
 * Run dbmate against production CockroachDB.
 *
 * Usage:
 *   bun src/db/migrate-prod.ts status
 *   bun src/db/migrate-prod.ts up
 *   bun src/db/migrate-prod.ts down
 */

import 'dotenv/config';
import { execSync } from 'child_process';

const action = process.argv[2] || 'status';
const allowed = ['up', 'down', 'status'];

if (!allowed.includes(action)) {
  console.error(`❌ Invalid action: "${action}". Use: ${allowed.join(', ')}`);
  process.exit(1);
}

const url = process.env.DB_PROD_URL;
if (!url || url.includes('YOUR_USER')) {
  console.error('❌ DB_PROD_URL belum diisi di .env');
  process.exit(1);
}

console.log(`🔗 Target: CockroachDB (production)`);
console.log(`📋 Action: dbmate ${action}\n`);

try {
  execSync(`DATABASE_URL="${url}" dbmate --no-dump-schema --migrations-dir db/migrations ${action}`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
} catch {
  process.exit(1);
}
