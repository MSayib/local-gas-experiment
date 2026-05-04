-- migrate:up
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reference VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(type);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at DESC);

-- migrate:down
DROP TABLE IF EXISTS stock_movements;
