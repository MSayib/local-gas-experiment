/**
 * StockHistory — Modal showing stock movement history for a product.
 */

import { useEffect } from 'react';
import Modal from './Modal';
import { useStockMovements, type ProductData } from '../lib/hooks/useData';

interface StockHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductData | null;
}

export default function StockHistory({ isOpen, onClose, product }: StockHistoryProps) {
  const { movements, loading, refresh } = useStockMovements(product?.id);

  useEffect(() => {
    if (isOpen && product) refresh();
  }, [isOpen, product, refresh]);

  if (!product) return null;

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`📋 Riwayat Stok — ${product.sku}`} width="600px">
      <div className="stock-form-product" style={{ marginBottom: 16 }}>
        <span>{product.name}</span>
        <span className="badge badge-neutral">Stok Saat Ini: {product.stock.toLocaleString('id-ID')}</span>
      </div>

      {loading ? (
        <div className="loading" style={{ padding: '32px 0' }}>
          <div className="spinner" />
          <p>Memuat riwayat...</p>
        </div>
      ) : movements.length === 0 ? (
        <div className="cell-empty" style={{ padding: '32px', textAlign: 'center' }}>
          Belum ada riwayat pergerakan stok
        </div>
      ) : (
        <div className="table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table className="table table-compact">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Tipe</th>
                <th>Jumlah</th>
                <th>Referensi</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td className="cell-nowrap">{formatDate(m.createdAt)}</td>
                  <td>
                    <span className={`badge ${m.type === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                      {m.type === 'IN' ? '📥 Masuk' : '📤 Keluar'}
                    </span>
                  </td>
                  <td className="cell-right">{m.quantity.toLocaleString('id-ID')}</td>
                  <td className="cell-mono">{m.reference}</td>
                  <td className="cell-muted">{m.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
