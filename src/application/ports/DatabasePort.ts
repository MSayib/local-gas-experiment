/**
 * DatabasePort — Interface defining the contract for database access.
 *
 * High-level modules (Use Cases) depend on this abstraction,
 * NOT on concrete implementations (pg, Jdbc).
 *
 * Implements: Dependency Inversion Principle (DIP)
 * Implements: Interface Segregation Principle (ISP)
 */

export interface QueryResult {
  readonly rows: Record<string, unknown>[];
  readonly rowCount?: number;
}

export interface DatabasePort {
  /**
   * Execute a SELECT query and return rows.
   * Uses parameterized queries to prevent SQL injection.
   */
  query(sql: string, params?: unknown[]): Promise<QueryResult>;

  /**
   * Execute an INSERT/UPDATE/DELETE statement.
   * Returns affected row count.
   */
  execute(sql: string, params?: unknown[]): Promise<QueryResult>;

  /**
   * Release database connection/pool resources.
   */
  close(): Promise<void>;
}
