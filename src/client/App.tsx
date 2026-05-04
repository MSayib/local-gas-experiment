import { useState, useCallback } from 'react';
import { useProducts, useSummary, useStockMovements, type ProductData, type CreateProductInput } from './lib/hooks/useData';
import SummaryCards from './components/SummaryCards';
import ProductTable from './components/ProductTable';
import ProductForm from './components/ProductForm';
import StockForm from './components/StockForm';
import StockHistory from './components/StockHistory';
import ConfirmDialog from './components/ConfirmDialog';

type ModalState =
  | { type: 'none' }
  | { type: 'createProduct' }
  | { type: 'editProduct'; product: ProductData }
  | { type: 'stockIn'; product: ProductData }
  | { type: 'stockOut'; product: ProductData }
  | { type: 'history'; product: ProductData }
  | { type: 'deleteConfirm'; product: ProductData };

export default function App() {
  const { products, loading, error, refresh, createProduct, updateProduct, deleteProduct } = useProducts();
  const { summary, refresh: refreshSummary } = useSummary();
  const { recordStockIn, recordStockOut } = useStockMovements();
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [activeTab, setActiveTab] = useState<'gudang' | 'penjualan' | 'invoice'>('gudang');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const closeModal = () => setModal({ type: 'none' });

  const refreshAll = async () => {
    await Promise.all([refresh(), refreshSummary()]);
  };

  const handleCreateProduct = async (input: CreateProductInput) => {
    await createProduct(input);
    await refreshSummary();
    showToast(`Produk "${input.name}" berhasil ditambahkan`);
  };

  const handleUpdateProduct = async (input: CreateProductInput) => {
    if (modal.type !== 'editProduct') return;
    await updateProduct(modal.product.id, input);
    await refreshSummary();
    showToast(`Produk "${input.name}" berhasil diperbarui`);
  };

  const handleDeleteProduct = async () => {
    if (modal.type !== 'deleteConfirm') return;
    await deleteProduct(modal.product.id);
    await refreshSummary();
    showToast(`Produk "${modal.product.name}" berhasil dihapus`);
  };

  const handleStockIn = async (input: { productId: string; quantity: number; reference: string; notes?: string }) => {
    await recordStockIn(input);
    await refreshAll();
    showToast(`Stok masuk berhasil dicatat`);
  };

  const handleStockOut = async (input: { productId: string; quantity: number; reference: string; notes?: string }) => {
    await recordStockOut(input);
    await refreshAll();
    showToast(`Stok keluar berhasil dicatat`);
  };

  return (
    <div className="app">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">📦 Dashboard Management</h1>
          <span className="header-badge">MVP • Experimental</span>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <button className={`nav-tab ${activeTab === 'gudang' ? 'active' : ''}`} onClick={() => setActiveTab('gudang')}>
          🏭 Gudang
        </button>
        <button className={`nav-tab ${activeTab === 'penjualan' ? 'active' : ''}`} onClick={() => setActiveTab('penjualan')} disabled>
          📊 Penjualan
        </button>
        <button className={`nav-tab ${activeTab === 'invoice' ? 'active' : ''}`} onClick={() => setActiveTab('invoice')} disabled>
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
        ) : error ? (
          <div className="error-banner">
            <p>❌ {error}</p>
            <button className="btn btn-ghost" onClick={refresh}>Coba Lagi</button>
          </div>
        ) : (
          <>
            <SummaryCards summary={summary} />

            <div className="card">
              <div className="card-header">
                <h2>Daftar Produk</h2>
                <div className="card-header-actions">
                  <button className="btn btn-ghost" onClick={refreshAll}>🔄 Refresh</button>
                  <button className="btn btn-primary" onClick={() => setModal({ type: 'createProduct' })}>
                    + Tambah Produk
                  </button>
                </div>
              </div>

              <ProductTable
                products={products}
                onEdit={(p) => setModal({ type: 'editProduct', product: p })}
                onDelete={(p) => setModal({ type: 'deleteConfirm', product: p })}
                onStockIn={(p) => setModal({ type: 'stockIn', product: p })}
                onStockOut={(p) => setModal({ type: 'stockOut', product: p })}
                onViewHistory={(p) => setModal({ type: 'history', product: p })}
              />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>GAS TypeScript Experiment • Clean Architecture • {new Date().getFullYear()}</p>
      </footer>

      {/* Modals */}
      <ProductForm
        isOpen={modal.type === 'createProduct'}
        onClose={closeModal}
        onSubmit={handleCreateProduct}
      />

      <ProductForm
        isOpen={modal.type === 'editProduct'}
        onClose={closeModal}
        onSubmit={handleUpdateProduct}
        product={modal.type === 'editProduct' ? modal.product : null}
      />

      <StockForm
        isOpen={modal.type === 'stockIn'}
        onClose={closeModal}
        onSubmit={handleStockIn}
        product={modal.type === 'stockIn' ? modal.product : null}
        type="IN"
      />

      <StockForm
        isOpen={modal.type === 'stockOut'}
        onClose={closeModal}
        onSubmit={handleStockOut}
        product={modal.type === 'stockOut' ? modal.product : null}
        type="OUT"
      />

      <StockHistory
        isOpen={modal.type === 'history'}
        onClose={closeModal}
        product={modal.type === 'history' ? modal.product : null}
      />

      <ConfirmDialog
        isOpen={modal.type === 'deleteConfirm'}
        onClose={closeModal}
        onConfirm={handleDeleteProduct}
        product={modal.type === 'deleteConfirm' ? modal.product : null}
      />
    </div>
  );
}
