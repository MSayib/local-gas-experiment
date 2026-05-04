/**
 * Local Development Server — Hono API.
 *
 * Mirrors the GAS server functions as HTTP endpoints.
 * Reuses the SAME use cases as GAS production — only the wiring differs.
 *
 * Run: bun --watch src/server/local/index.ts
 */

import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

// --- Infrastructure ---
import { PgDatabaseGateway } from '@adapters/gateways/PgDatabaseGateway';
import { SqlProductRepository } from '@adapters/repositories/SqlProductRepository';
import { SqlStockMovementRepository } from '@adapters/repositories/SqlStockMovementRepository';

// --- Use Cases ---
import { GetProductsUseCase } from '@application/use-cases/warehouse/GetProductsUseCase';
import { CreateProductUseCase } from '@application/use-cases/warehouse/CreateProductUseCase';
import { RecordStockInUseCase } from '@application/use-cases/warehouse/RecordStockInUseCase';
import { RecordStockOutUseCase } from '@application/use-cases/warehouse/RecordStockOutUseCase';
import { GetStockSummaryUseCase } from '@application/use-cases/warehouse/GetStockSummaryUseCase';

// ============================================
// Dependency Injection
// ============================================

const db = new PgDatabaseGateway({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5433,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'gas_experiment',
});

const productRepo = new SqlProductRepository(db);
const stockMovementRepo = new SqlStockMovementRepository(db);

const getProducts = new GetProductsUseCase(productRepo);
const createProduct = new CreateProductUseCase(productRepo);
const recordStockIn = new RecordStockInUseCase(productRepo, stockMovementRepo);
const recordStockOut = new RecordStockOutUseCase(productRepo, stockMovementRepo);
const getStockSummary = new GetStockSummaryUseCase(db);

// ============================================
// Hono App
// ============================================

const app = new Hono();

app.use('/*', cors({ origin: 'http://localhost:5173' }));

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', environment: 'local-dev' });
});

// --- Products ---

app.post('/api/getProducts', async (c) => {
  const products = await getProducts.execute();
  return c.json(products.map(p => p.toJSON()));
});

app.post('/api/createProduct', async (c) => {
  const { args } = await c.req.json();
  const input = args[0];
  const product = await createProduct.execute(input);
  return c.json(product.toJSON());
});

app.post('/api/updateProduct', async (c) => {
  const { args } = await c.req.json();
  const [id, input] = args;
  const product = await productRepo.update(id, input);
  return c.json(product.toJSON());
});

app.post('/api/deleteProduct', async (c) => {
  const { args } = await c.req.json();
  await productRepo.delete(args[0]);
  return c.json({ success: true });
});

// --- Stock Movements ---

app.post('/api/recordStockIn', async (c) => {
  const { args } = await c.req.json();
  const movement = await recordStockIn.execute(args[0]);
  return c.json(movement.toJSON());
});

app.post('/api/recordStockOut', async (c) => {
  const { args } = await c.req.json();
  const movement = await recordStockOut.execute(args[0]);
  return c.json(movement.toJSON());
});

app.post('/api/getStockMovements', async (c) => {
  const { args } = await c.req.json();
  const productId = args?.[0];
  const movements = productId
    ? await stockMovementRepo.findByProductId(productId)
    : await stockMovementRepo.findAll();
  return c.json(movements.map(m => m.toJSON()));
});

// --- Summary ---

app.post('/api/getStockSummary', async (c) => {
  const summary = await getStockSummary.execute();
  return c.json(summary);
});

// --- Error Handler ---
app.onError((err, c) => {
  console.error('❌ API Error:', err.message);
  return c.json({ error: err.message }, 400);
});

// --- Start Server ---
console.log('🚀 Local dev server running at http://localhost:3001');
console.log('📡 API endpoints:');
console.log('   GET  /api/health');
console.log('   POST /api/getProducts, createProduct, updateProduct, deleteProduct');
console.log('   POST /api/recordStockIn, recordStockOut, getStockMovements');
console.log('   POST /api/getStockSummary');

export default {
  port: 3001,
  fetch: app.fetch,
};
