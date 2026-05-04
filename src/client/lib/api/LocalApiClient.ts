/**
 * LocalApiClient — fetch-based API client for local development.
 *
 * Calls the Hono dev server via Vite proxy (/api → localhost:3001).
 */

import type { ApiClient } from './ApiClient';

export class LocalApiClient implements ApiClient {
  async call<T>(functionName: string, ...args: unknown[]): Promise<T> {
    const response = await fetch(`/api/${functionName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ args }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API call "${functionName}" failed: ${error}`);
    }

    return response.json() as Promise<T>;
  }
}
