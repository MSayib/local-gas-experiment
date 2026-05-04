/**
 * StockForm — Record stock IN/OUT form inside a Modal.
 */

import { useState, useEffect } from 'react';
import Modal from './Modal';
import type { ProductData } from '../lib/hooks/useData';

interface StockFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: { productId: string; quantity: number; reference: string; notes?: string }) => Promise<void>;
  product: ProductData | null;
  type: 'IN' | 'OUT';
}

export default function StockForm({ isOpen, onClose, onSubmit, product, type }: StockFormProps) {
  const [quantity, setQuantity] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuantity('');
    setReference('');
    setNotes('');
    setError(null);
  }, [isOpen]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError('Jumlah harus lebih dari 0');
      return;
    }
    if (!reference.trim()) {
      setError('Referensi wajib diisi (mis. PO-2026-001)');
      return;
    }
    if (type === 'OUT' && qty > product.stock) {
      setError(`Stok tidak cukup. Tersedia: ${product.stock}`);
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        productId: product.id,
        quantity: qty,
        reference: reference.trim(),
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mencatat');
    } finally {
      setLoading(false);
    }
  };

  const isIn = type === 'IN';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isIn ? '📥 Stok Masuk' : '📤 Stok Keluar'}
    >
      <div className="stock-form-product">
        <span className="cell-mono">{product.sku}</span>
        <span>{product.name}</span>
        <span className="badge badge-neutral">Stok: {product.stock.toLocaleString('id-ID')}</span>
      </div>

      <form onSubmit={handleSubmit} className="form">
        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Jumlah ({product.unit})</label>
          <input
            className="form-input"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="100"
            min="1"
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Referensi</label>
          <input
            className="form-input"
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder={isIn ? 'PO-2026-001' : 'SO-2026-001'}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Catatan (opsional)</label>
          <textarea
            className="form-input form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan tambahan..."
            rows={2}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Batal
          </button>
          <button
            type="submit"
            className={`btn ${isIn ? 'btn-success' : 'btn-danger'}`}
            disabled={loading}
          >
            {loading ? 'Memproses...' : isIn ? '📥 Catat Masuk' : '📤 Catat Keluar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
