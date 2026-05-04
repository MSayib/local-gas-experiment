/**
 * ProductForm — Create/Edit product form inside a Modal.
 */

import { useState, useEffect } from 'react';
import Modal from './Modal';
import type { ProductData, CreateProductInput } from '../lib/hooks/useData';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateProductInput) => Promise<void>;
  product?: ProductData | null; // null = create, ProductData = edit
}

export default function ProductForm({ isOpen, onClose, onSubmit, product }: ProductFormProps) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!product;

  useEffect(() => {
    if (product) {
      setSku(product.sku);
      setName(product.name);
      setPrice(product.price.toString());
      setUnit(product.unit);
    } else {
      setSku('');
      setName('');
      setPrice('');
      setUnit('pcs');
    }
    setError(null);
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sku.trim() || !name.trim() || !price.trim()) {
      setError('Semua field wajib diisi');
      return;
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Harga harus berupa angka positif');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({ sku: sku.trim(), name: name.trim(), price: priceNum, unit: unit.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? '✏️ Edit Produk' : '📦 Tambah Produk Baru'}>
      <form onSubmit={handleSubmit} className="form">
        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">SKU</label>
          <input
            className="form-input"
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="SKU-001"
            disabled={isEdit}
            autoFocus={!isEdit}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Nama Produk</label>
          <input
            className="form-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Baut M8x20"
            autoFocus={isEdit}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Harga (Rp)</label>
            <input
              className="form-input"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="500"
              min="0"
              step="1"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Satuan</label>
            <select className="form-input" value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="pcs">pcs</option>
              <option value="kg">kg</option>
              <option value="meter">meter</option>
              <option value="lembar">lembar</option>
              <option value="batang">batang</option>
              <option value="box">box</option>
              <option value="roll">roll</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
