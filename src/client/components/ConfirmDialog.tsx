/**
 * ConfirmDialog — Delete confirmation modal.
 */

import { useState } from 'react';
import Modal from './Modal';
import type { ProductData } from '../lib/hooks/useData';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  product: ProductData | null;
}

export default function ConfirmDialog({ isOpen, onClose, onConfirm, product }: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!product) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚠️ Konfirmasi Hapus" width="400px">
      <div className="confirm-body">
        <p>Apakah Anda yakin ingin menghapus produk ini?</p>
        <div className="confirm-product">
          <span className="cell-mono">{product.sku}</span>
          <span>{product.name}</span>
        </div>
        <p className="confirm-warning">
          Semua data stok terkait juga akan dihapus. Tindakan ini tidak bisa dibatalkan.
        </p>
      </div>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
          Batal
        </button>
        <button className="btn btn-danger" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Menghapus...' : '🗑️ Hapus'}
        </button>
      </div>
    </Modal>
  );
}
