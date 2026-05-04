/**
 * Seed Script — Insert sample data into local PostgreSQL.
 *
 * Run: bun src/db/seed.ts
 */

import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5433,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'gas_experiment',
});

const products = [
  { sku: 'SKU-001', name: 'Baut M8x20', price: 500, unit: 'pcs', stock: 1500 },
  { sku: 'SKU-002', name: 'Mur M8', price: 300, unit: 'pcs', stock: 2000 },
  { sku: 'SKU-003', name: 'Ring Plat M8', price: 200, unit: 'pcs', stock: 5 },
  { sku: 'SKU-004', name: 'Pipa Besi 1 inch', price: 45000, unit: 'batang', stock: 120 },
  { sku: 'SKU-005', name: 'Plat Baja 2mm', price: 250000, unit: 'lembar', stock: 35 },
];

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data
  await pool.query('DELETE FROM stock_movements');
  await pool.query('DELETE FROM products');
  console.log('   Cleared existing data');

  // Insert products
  for (const p of products) {
    await pool.query(
      `INSERT INTO products (sku, name, price, unit, stock) VALUES ($1, $2, $3, $4, $5)`,
      [p.sku, p.name, p.price, p.unit, p.stock]
    );
    console.log(`   ✅ ${p.sku} — ${p.name} (stock: ${p.stock})`);
  }

  // Insert sample stock movements
  const result = await pool.query('SELECT id, sku FROM products LIMIT 2');
  const [product1, product2] = result.rows;

  if (product1) {
    await pool.query(
      `INSERT INTO stock_movements (product_id, type, quantity, reference, notes) VALUES ($1, 'IN', 500, 'PO-2026-001', 'Purchase order initial')`,
      [product1.id]
    );
    await pool.query(
      `INSERT INTO stock_movements (product_id, type, quantity, reference, notes) VALUES ($1, 'OUT', 100, 'SO-2026-001', 'Sales order')`,
      [product1.id]
    );
    console.log(`   ✅ Stock movements for ${product1.sku}`);
  }

  if (product2) {
    await pool.query(
      `INSERT INTO stock_movements (product_id, type, quantity, reference, notes) VALUES ($1, 'IN', 1000, 'PO-2026-002', 'Bulk purchase')`,
      [product2.id]
    );
    console.log(`   ✅ Stock movements for ${product2.sku}`);
  }

  console.log('\n✅ Seed complete!');
  await pool.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
