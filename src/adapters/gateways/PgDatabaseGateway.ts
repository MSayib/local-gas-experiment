/**
 * PgDatabaseGateway — Local Development adapter.
 *
 * Implements DatabasePort using node-postgres (pg).
 * Connects to local PostgreSQL at localhost:5433.
 *
 * ⚠️  This file is NOT bundled for GAS (excluded via esbuild external + .claspignore).
 */

import { Pool } from 'pg';
import type { PoolConfig } from 'pg';
import type { DatabasePort, QueryResult } from '@application/ports/DatabasePort';

export class PgDatabaseGateway implements DatabasePort {
  private pool: Pool;

  constructor(config: PoolConfig) {
    this.pool = new Pool(config);
  }

  async query(sql: string, params?: unknown[]): Promise<QueryResult> {
    const result = await this.pool.query(sql, params);
    return {
      rows: result.rows as Record<string, unknown>[],
      rowCount: result.rowCount ?? undefined,
    };
  }

  async execute(sql: string, params?: unknown[]): Promise<QueryResult> {
    return this.query(sql, params);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
