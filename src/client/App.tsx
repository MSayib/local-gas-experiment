import { useState, useEffect } from 'react';
import { apiClient } from './lib/api';

interface ProductData {
  id: string;
  sku: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  stockValue: number;
}

interface StockSummary {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
}

export default function App() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gudang' | 'penjualan' | 'invoice'>('gudang');

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, summaryData] = await Promise.all([
          apiClient.call<ProductData[]>('getProducts'),
          apiClient.call<StockSummary>('getStockSummary'),
        ]);
        setProducts(productsData);
        setSummary(summaryData);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">📦 Dashboard Management</h1>
          <span className="header-badge">MVP • Experimental</span>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'gudang' ? 'active' : ''}`}
          onClick={() => setActiveTab('gudang')}
        >
          🏭 Gudang
        </button>
        <button
          className={`nav-tab ${activeTab === 'penjualan' ? 'active' : ''}`}
          onClick={() => setActiveTab('penjualan')}
          disabled
        >
          📊 Penjualan
        </button>
        <button
          className={`nav-tab ${activeTab === 'invoice' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoice')}
          disabled
        >
          📄 Invoice
        </button>
      </nav>

      {/* Main Content */}
      <main className="main">
        {loading ? (
          <div className="loading">
            <div className="spinner" />
            <p>Memuat data...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            {summary && (
              <div className="summary-grid">
                <div className="card summary-card">
                  <span className="card-icon">📦</span>
                  <div className="card-info">
                    <p className="card-label">Total Produk</p>
                    <p className="card-value">{summary.totalProducts}</p>
                  </div>
                </div>
                <div className="card summary-card">
                  <span className="card-icon">📊</span>
                  <div className="card-info">
                    <p className="card-label">Total Stok</p>
                    <p className="card-value">{summary.totalStock.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div className="card summary-card">
                  <span className="card-icon">💰</span>
                  <div className="card-info">
                    <p className="card-label">Nilai Inventaris</p>
                    <p className="card-value">{formatCurrency(summary.totalValue)}</p>
                  </div>
                </div>
                <div className="card summary-card warning">
                  <span className="card-icon">⚠️</span>
                  <div className="card-info">
                    <p className="card-label">Stok Rendah</p>
                    <p className="card-value">{summary.lowStockCount}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Product Table */}
            <div className="card">
              <div className="card-header">
                <h2>Daftar Produk</h2>
                <button className="btn btn-primary" disabled>
                  + Tambah Produk
                </button>
              </div>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Nama Produk</th>
                      <th>Harga</th>
                      <th>Satuan</th>
                      <th>Stok</th>
                      <th>Nilai Stok</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="cell-mono">{product.sku}</td>
                        <td>{product.name}</td>
                        <td className="cell-right">{formatCurrency(product.price)}</td>
                        <td>{product.unit}</td>
                        <td className="cell-right">{product.stock.toLocaleString('id-ID')}</td>
                        <td className="cell-right">{formatCurrency(product.stockValue)}</td>
                        <td>
                          <span className={`badge ${product.stock <= 10 ? 'badge-danger' : 'badge-success'}`}>
                            {product.stock <= 10 ? 'Rendah' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>GAS TypeScript Experiment • Clean Architecture • {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
