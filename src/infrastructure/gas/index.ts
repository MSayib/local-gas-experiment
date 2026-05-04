/**
 * GAS Entry Point — Infrastructure Layer.
 *
 * Handles Dependency Injection wiring and global scope exposure.
 * Bundled by esbuild into dist/bundle.gs (IIFE format).
 */

import { JdbcDatabaseGateway } from '@adapters/gateways/JdbcDatabaseGateway';
import { SqlProductRepository } from '@adapters/repositories/SqlProductRepository';
import { SqlStockMovementRepository } from '@adapters/repositories/SqlStockMovementRepository';
import { GetProductsUseCase } from '@application/use-cases/warehouse/GetProductsUseCase';
import { CreateProductUseCase } from '@application/use-cases/warehouse/CreateProductUseCase';
import { RecordStockInUseCase } from '@application/use-cases/warehouse/RecordStockInUseCase';
import { RecordStockOutUseCase } from '@application/use-cases/warehouse/RecordStockOutUseCase';
import { GetStockSummaryUseCase } from '@application/use-cases/warehouse/GetStockSummaryUseCase';

// ============================================
// Lazy DI Container — initialized on first call
// ============================================

function createContainer() {
  const db = new JdbcDatabaseGateway();
  const productRepo = new SqlProductRepository(db);
  const stockMovementRepo = new SqlStockMovementRepository(db);

  return {
    getProducts: new GetProductsUseCase(productRepo),
    createProduct: new CreateProductUseCase(productRepo),
    recordStockIn: new RecordStockInUseCase(productRepo, stockMovementRepo),
    recordStockOut: new RecordStockOutUseCase(productRepo, stockMovementRepo),
    getStockSummary: new GetStockSummaryUseCase(db),
    productRepo,
    stockMovementRepo,
  };
}

let _container: ReturnType<typeof createContainer> | null = null;
function container() {
  if (!_container) _container = createContainer();
  return _container;
}

// ============================================
// Server Functions (called by google.script.run)
// ============================================

function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Dashboard Management')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getProducts(): Record<string, unknown>[] {
  const products = container().getProducts.execute();
  // GAS V8 handles async/await — resolves synchronously in this context
  return (products as unknown as import('@domain/entities/Product').Product[]).map(p => p.toJSON());
}

function createProduct(input: { sku: string; name: string; price: number; unit: string }): Record<string, unknown> {
  const product = container().createProduct.execute(input);
  return (product as unknown as import('@domain/entities/Product').Product).toJSON();
}

function recordStockIn(input: { productId: string; quantity: number; reference: string; notes?: string }): Record<string, unknown> {
  const movement = container().recordStockIn.execute(input);
  return (movement as unknown as import('@domain/entities/StockMovement').StockMovement).toJSON();
}

function recordStockOut(input: { productId: string; quantity: number; reference: string; notes?: string }): Record<string, unknown> {
  const movement = container().recordStockOut.execute(input);
  return (movement as unknown as import('@domain/entities/StockMovement').StockMovement).toJSON();
}

function getStockSummary(): Record<string, unknown> {
  return container().getStockSummary.execute() as unknown as Record<string, unknown>;
}

function getStockMovements(productId?: string): Record<string, unknown>[] {
  const c = container();
  const movements = productId
    ? c.stockMovementRepo.findByProductId(productId)
    : c.stockMovementRepo.findAll();
  return (movements as unknown as import('@domain/entities/StockMovement').StockMovement[]).map(m => m.toJSON());
}

// ============================================
// Expose to GAS Global Scope
// ============================================

(globalThis as Record<string, unknown>).doGet = doGet;
(globalThis as Record<string, unknown>).getProducts = getProducts;
(globalThis as Record<string, unknown>).createProduct = createProduct;
(globalThis as Record<string, unknown>).recordStockIn = recordStockIn;
(globalThis as Record<string, unknown>).recordStockOut = recordStockOut;
(globalThis as Record<string, unknown>).getStockSummary = getStockSummary;
(globalThis as Record<string, unknown>).getStockMovements = getStockMovements;
