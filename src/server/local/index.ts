/**
 * Local Development Server — Hono API.
 *
 * Mirrors the GAS server functions as HTTP endpoints.
 * Reuses the SAME use cases as GAS production — only the wiring differs.
 *
 * Run: bun --watch src/server/local/index.ts
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Product } from '@domain/entities/Product';
import { Money } from '@domain/entities/common/ValueObjects';

const app = new Hono();

// CORS for Vite dev server
app.use('/*', cors({ origin: 'http://localhost:5173' }));

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', environment: 'local-dev' });
});

// --- Server Functions (mirror GAS global functions) ---

app.post('/api/getProducts', async (c) => {
  // TODO: Replace with real use case + PgDatabaseGateway in Phase 2
  const mockProducts = [
    new Product({
      id: '1',
      sku: 'SKU-001',
      name: 'Baut M8x20',
      price: Money.create(500),
      unit: 'pcs',
      stock: 1500,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    new Product({
      id: '2',
      sku: 'SKU-002',
      name: 'Mur M8',
      price: Money.create(300),
      unit: 'pcs',
      stock: 2000,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    new Product({
      id: '3',
      sku: 'SKU-003',
      name: 'Ring Plat M8',
      price: Money.create(200),
      unit: 'pcs',
      stock: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ];

  return c.json(mockProducts.map(p => p.toJSON()));
});

app.post('/api/getStockSummary', async (c) => {
  // TODO: Replace with real use case in Phase 2
  return c.json({
    totalProducts: 3,
    totalStock: 3505,
    totalValue: 1510000,
    lowStockCount: 1,
  });
});

// --- Start Server ---
console.log('🚀 Local dev server running at http://localhost:3001');
console.log('📡 API endpoints:');
console.log('   GET  /api/health');
console.log('   POST /api/getProducts');
console.log('   POST /api/getStockSummary');

export default {
  port: 3001,
  fetch: app.fetch,
};
