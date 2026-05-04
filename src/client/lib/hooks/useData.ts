/**
 * React Hooks for data fetching and mutations.
 * Centralizes all API interactions.
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api';

// --- Types ---

export interface ProductData {
  id: string;
  sku: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  stockValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockSummary {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
}

export interface StockMovementData {
  id: string;
  productId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reference: string;
  notes: string | null;
  createdAt: string;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  price: number;
  unit: string;
}

// --- useProducts ---

export function useProducts() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.call<ProductData[]>('getProducts');
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const createProduct = async (input: CreateProductInput) => {
    const product = await apiClient.call<ProductData>('createProduct', input);
    await refresh();
    return product;
  };

  const updateProduct = async (id: string, input: Partial<CreateProductInput>) => {
    const product = await apiClient.call<ProductData>('updateProduct', id, input);
    await refresh();
    return product;
  };

  const deleteProduct = async (id: string) => {
    await apiClient.call('deleteProduct', id);
    await refresh();
  };

  return { products, loading, error, refresh, createProduct, updateProduct, deleteProduct };
}

// --- useSummary ---

export function useSummary() {
  const [summary, setSummary] = useState<StockSummary | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await apiClient.call<StockSummary>('getStockSummary');
      setSummary(data);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { summary, refresh };
}

// --- useStockMovements ---

export function useStockMovements(productId?: string) {
  const [movements, setMovements] = useState<StockMovementData[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = productId
        ? await apiClient.call<StockMovementData[]>('getStockMovements', productId)
        : await apiClient.call<StockMovementData[]>('getStockMovements');
      setMovements(data);
    } catch (err) {
      console.error('Failed to load movements:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { refresh(); }, [refresh]);

  const recordStockIn = async (input: { productId: string; quantity: number; reference: string; notes?: string }) => {
    await apiClient.call('recordStockIn', input);
    await refresh();
  };

  const recordStockOut = async (input: { productId: string; quantity: number; reference: string; notes?: string }) => {
    await apiClient.call('recordStockOut', input);
    await refresh();
  };

  return { movements, loading, refresh, recordStockIn, recordStockOut };
}
