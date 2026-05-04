/**
 * JdbcDatabaseGateway — GAS Production adapter.
 *
 * Implements DatabasePort using Google Apps Script JDBC service.
 * Connects to CockroachDB (PostgreSQL-compatible) in production.
 *
 * This file is bundled into dist/bundle.gs by esbuild.
 */

import type { DatabasePort, QueryResult } from '@application/ports/DatabasePort';

export class JdbcDatabaseGateway implements DatabasePort {
  private conn: GoogleAppsScript.JDBC.JdbcConnection;

  constructor() {
    const props = PropertiesService.getScriptProperties();
    const url = props.getProperty('DB_URL');
    const user = props.getProperty('DB_USER');
    const password = props.getProperty('DB_PASSWORD');

    if (!url || !user || !password) {
      throw new Error(
        'Database credentials not found in Script Properties. ' +
        'Set DB_URL, DB_USER, DB_PASSWORD in Project Settings > Script Properties.'
      );
    }

    this.conn = Jdbc.getConnection(url, user, password);
  }

  async query(sql: string, params?: unknown[]): Promise<QueryResult> {
    // GAS JDBC doesn't support RETURNING clause.
    // Split into executeUpdate + SELECT when detected.
    if (/\bRETURNING\b/i.test(sql)) {
      return this.queryWithReturning(sql, params);
    }

    const stmt = params
      ? this.prepareStatement(sql, params)
      : this.conn.createStatement();

    const jdbcSql = this.toJdbcSql(sql);
    const rs = params
      ? (stmt as GoogleAppsScript.JDBC.JdbcPreparedStatement).executeQuery()
      : (stmt as GoogleAppsScript.JDBC.JdbcStatement).executeQuery(jdbcSql);

    const rows = this.extractRows(rs);
    rs.close();
    stmt.close();
    return { rows };
  }

  /**
   * Handle INSERT/UPDATE ... RETURNING by:
   * 1. Stripping RETURNING clause
   * 2. Executing the mutation
   * 3. Running a separate SELECT to fetch the result
   */
  private async queryWithReturning(sql: string, params?: unknown[]): Promise<QueryResult> {
    // Parse: extract table name and RETURNING columns
    const returningMatch = sql.match(/\bRETURNING\s+(.+)$/is);
    const returningCols = returningMatch ? returningMatch[1].trim() : '*';

    // Strip the RETURNING clause for the mutation
    const mutationSql = sql.replace(/\s*RETURNING\s+.+$/is, '');

    // Detect table name from INSERT INTO <table> or UPDATE <table>
    const tableMatch = sql.match(/(?:INSERT\s+INTO|UPDATE)\s+(\w+)/i);
    const table = tableMatch ? tableMatch[1] : '';

    // Execute the mutation
    const stmt = params
      ? this.prepareStatement(mutationSql, params)
      : this.conn.createStatement();

    if (params) {
      (stmt as GoogleAppsScript.JDBC.JdbcPreparedStatement).executeUpdate();
    } else {
      (stmt as GoogleAppsScript.JDBC.JdbcStatement).executeUpdate(mutationSql);
    }
    stmt.close();

    // For INSERT: fetch the last inserted row by created_at DESC
    // For UPDATE: fetch by the ID param (last param for UPDATE, or WHERE condition)
    const isInsert = /^\s*INSERT/i.test(sql);
    let selectSql: string;
    let selectParams: unknown[] | undefined;

    if (isInsert) {
      selectSql = `SELECT ${returningCols} FROM ${table} ORDER BY created_at DESC LIMIT 1`;
    } else {
      // UPDATE: the WHERE clause ID is typically the last parameter
      const idParam = params ? params[params.length - 1] : undefined;
      selectSql = `SELECT ${returningCols} FROM ${table} WHERE id = $1`;
      selectParams = idParam ? [idParam] : undefined;
    }

    const selectStmt = selectParams
      ? this.prepareStatement(selectSql, selectParams)
      : this.conn.createStatement();

    const rs = selectParams
      ? (selectStmt as GoogleAppsScript.JDBC.JdbcPreparedStatement).executeQuery()
      : (selectStmt as GoogleAppsScript.JDBC.JdbcStatement).executeQuery(selectSql);

    const rows = this.extractRows(rs);
    rs.close();
    selectStmt.close();
    return { rows };
  }

  private extractRows(rs: GoogleAppsScript.JDBC.JdbcResultSet): Record<string, unknown>[] {
    const meta = rs.getMetaData();
    const colCount = meta.getColumnCount();
    const rows: Record<string, unknown>[] = [];

    while (rs.next()) {
      const row: Record<string, unknown> = {};
      for (let i = 1; i <= colCount; i++) {
        row[meta.getColumnName(i)] = rs.getObject(i);
      }
      rows.push(row);
    }
    return rows;
  }

  async execute(sql: string, params?: unknown[]): Promise<QueryResult> {
    const stmt = params
      ? this.prepareStatement(sql, params)
      : this.conn.createStatement();

    const jdbcSql = this.toJdbcSql(sql);
    const affected = params
      ? (stmt as GoogleAppsScript.JDBC.JdbcPreparedStatement).executeUpdate()
      : (stmt as GoogleAppsScript.JDBC.JdbcStatement).executeUpdate(jdbcSql);

    stmt.close();
    return { rows: [], rowCount: affected };
  }

  /**
   * Convert PostgreSQL-style SQL to JDBC-compatible SQL:
   * - $1, $2, ... → ?
   * - ::int, ::float, ::text → CAST(... AS ...)
   * - COUNT(*) FILTER (WHERE ...) → SUM(CASE WHEN ... THEN 1 ELSE 0 END)
   */
  private toJdbcSql(sql: string): string {
    // Replace $N placeholders with ?
    let result = sql.replace(/\$\d+/g, '?');

    // Replace ::type casts with CAST syntax
    // e.g., COUNT(*)::int → CAST(COUNT(*) AS INT)
    result = result.replace(
      /(\w+\([^)]*\))::([a-z]+)/gi,
      'CAST($1 AS $2)'
    );

    // Replace COALESCE(...)::type
    result = result.replace(
      /(COALESCE\([^)]+\))::([a-z]+)/gi,
      'CAST($1 AS $2)'
    );

    // Replace COUNT(*) FILTER (WHERE cond) → SUM(CASE WHEN cond THEN 1 ELSE 0 END)
    result = result.replace(
      /COUNT\(\*\)\s*FILTER\s*\(\s*WHERE\s+(.+?)\)/gi,
      'CAST(SUM(CASE WHEN $1 THEN 1 ELSE 0 END) AS INT)'
    );

    return result;
  }

  private prepareStatement(
    sql: string,
    params: unknown[]
  ): GoogleAppsScript.JDBC.JdbcPreparedStatement {
    const jdbcSql = this.toJdbcSql(sql);
    const stmt = this.conn.prepareStatement(jdbcSql);
    params.forEach((p, i) => {
      if (p === null || p === undefined) {
        stmt.setNull(i + 1, 0);
      } else if (typeof p === 'string') {
        stmt.setString(i + 1, p);
      } else if (typeof p === 'number') {
        stmt.setDouble(i + 1, p);
      } else if (typeof p === 'boolean') {
        stmt.setBoolean(i + 1, p);
      } else {
        stmt.setObject(i + 1, p);
      }
    });
    return stmt;
  }

  async close(): Promise<void> {
    this.conn.close();
  }
}
