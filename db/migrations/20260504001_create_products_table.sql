-- migrate:up
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_sku ON products(sku);

-- migrate:down
DROP TABLE IF EXISTS products;
