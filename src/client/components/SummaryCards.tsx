/**
 * SummaryCards — Dashboard overview cards.
 */

import type { StockSummary } from '../lib/hooks/useData';

interface SummaryCardsProps {
  summary: StockSummary | null;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

export default function SummaryCards({ summary }: SummaryCardsProps) {
  if (!summary) return null;

  const cards = [
    { icon: '📦', label: 'Total Produk', value: summary.totalProducts.toString(), className: '' },
    { icon: '📊', label: 'Total Stok', value: summary.totalStock.toLocaleString('id-ID'), className: '' },
    { icon: '💰', label: 'Nilai Inventaris', value: formatCurrency(summary.totalValue), className: '' },
    { icon: '⚠️', label: 'Stok Rendah', value: summary.lowStockCount.toString(), className: summary.lowStockCount > 0 ? 'warning' : '' },
  ];

  return (
    <div className="summary-grid">
      {cards.map((card) => (
        <div key={card.label} className={`card summary-card ${card.className}`}>
          <span className="card-icon">{card.icon}</span>
          <div className="card-info">
            <p className="card-label">{card.label}</p>
            <p className="card-value">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
