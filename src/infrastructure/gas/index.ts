/**
 * GAS Entry Point — Infrastructure Layer.
 *
 * This is the ONLY file that knows about ALL layers.
 * Handles Dependency Injection wiring and global scope exposure.
 *
 * Bundled by esbuild into dist/bundle.gs (IIFE format).
 */

import { JdbcDatabaseGateway } from '@adapters/gateways/JdbcDatabaseGateway';
import { Product } from '@domain/entities/Product';
import { Money } from '@domain/entities/common/ValueObjects';

// ============================================
// Server Functions (called by google.script.run)
// ============================================

/**
 * Serve the React dashboard as a web app.
 */
function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Dashboard Management')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Get all products from the database.
 */
function getProducts(): Record<string, unknown>[] {
  // TODO: Wire to real use case + JdbcDatabaseGateway in Phase 2
  // For now, return sample data to verify the pipeline works
  const products = [
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
  ];

  return products.map(p => p.toJSON());
}

/**
 * Get stock summary overview.
 */
function getStockSummary(): Record<string, unknown> {
  return {
    totalProducts: 3,
    totalStock: 3505,
    totalValue: 1510000,
    lowStockCount: 1,
  };
}

// ============================================
// Expose to GAS Global Scope
// Required because esbuild IIFE wraps everything in a closure.
// ============================================

(globalThis as Record<string, unknown>).doGet = doGet;
(globalThis as Record<string, unknown>).getProducts = getProducts;
(globalThis as Record<string, unknown>).getStockSummary = getStockSummary;
