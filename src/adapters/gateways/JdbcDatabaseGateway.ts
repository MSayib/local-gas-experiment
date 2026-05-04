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
    const stmt = params
      ? this.prepareStatement(sql, params)
      : this.conn.createStatement();

    const rs = params
      ? (stmt as GoogleAppsScript.JDBC.JdbcPreparedStatement).executeQuery()
      : (stmt as GoogleAppsScript.JDBC.JdbcStatement).executeQuery(sql);

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

    rs.close();
    stmt.close();
    return { rows };
  }

  async execute(sql: string, params?: unknown[]): Promise<QueryResult> {
    const stmt = params
      ? this.prepareStatement(sql, params)
      : this.conn.createStatement();

    const affected = params
      ? (stmt as GoogleAppsScript.JDBC.JdbcPreparedStatement).executeUpdate()
      : (stmt as GoogleAppsScript.JDBC.JdbcStatement).executeUpdate(sql);

    stmt.close();
    return { rows: [], rowCount: affected };
  }

  private prepareStatement(
    sql: string,
    params: unknown[]
  ): GoogleAppsScript.JDBC.JdbcPreparedStatement {
    const stmt = this.conn.prepareStatement(sql);
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
