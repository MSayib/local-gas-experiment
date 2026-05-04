/**
 * ProductTable — Interactive product table with actions.
 */

import type { ProductData } from '../lib/hooks/useData';

interface ProductTableProps {
  products: ProductData[];
  onEdit: (product: ProductData) => void;
  onDelete: (product: ProductData) => void;
  onStockIn: (product: ProductData) => void;
  onStockOut: (product: ProductData) => void;
  onViewHistory: (product: ProductData) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  onStockIn,
  onStockOut,
  onViewHistory,
}: ProductTableProps) {
  return (
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
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={8} className="cell-empty">
                Belum ada produk. Klik "Tambah Produk" untuk memulai.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id}>
                <td className="cell-mono">{product.sku}</td>
                <td>{product.name}</td>
                <td className="cell-right">{formatCurrency(product.price)}</td>
                <td>{product.unit}</td>
                <td className="cell-right">{product.stock.toLocaleString('id-ID')}</td>
                <td className="cell-right">{formatCurrency(product.stockValue)}</td>
                <td>
                  <span className={`badge ${product.stock <= 10 ? 'badge-danger' : product.stock <= 50 ? 'badge-warning' : 'badge-success'}`}>
                    {product.stock <= 10 ? 'Kritis' : product.stock <= 50 ? 'Rendah' : 'Normal'}
                  </span>
                </td>
                <td>
                  <div className="action-group">
                    <button className="action-btn" onClick={() => onStockIn(product)} title="Stok Masuk">📥</button>
                    <button className="action-btn" onClick={() => onStockOut(product)} title="Stok Keluar">📤</button>
                    <button className="action-btn" onClick={() => onViewHistory(product)} title="Riwayat">📋</button>
                    <button className="action-btn" onClick={() => onEdit(product)} title="Edit">✏️</button>
                    <button className="action-btn action-btn-danger" onClick={() => onDelete(product)} title="Hapus">🗑️</button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
