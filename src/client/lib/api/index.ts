/**
 * API Client — auto-detect environment and export the right implementation.
 *
 * In GAS: uses google.script.run (GasApiClient)
 * In local dev: uses fetch to Hono server (LocalApiClient)
 */

import type { ApiClient } from './ApiClient';
import { LocalApiClient } from './LocalApiClient';
import { GasApiClient } from './GasApiClient';

function detectEnvironment(): 'gas' | 'local' {
  try {
    return typeof (globalThis as Record<string, unknown>).google !== 'undefined' &&
      (globalThis as Record<string, Record<string, unknown>>).google?.script
      ? 'gas'
      : 'local';
  } catch {
    return 'local';
  }
}

const env = detectEnvironment();

export const apiClient: ApiClient = env === 'gas'
  ? new GasApiClient()
  : new LocalApiClient();

export type { ApiClient };
