/**
 * GasApiClient — google.script.run wrapper for GAS production.
 *
 * Wraps the callback-based google.script.run API in Promises.
 */

import type { ApiClient } from './ApiClient';

declare const google: {
  script: {
    run: Record<string, (...args: unknown[]) => void> & {
      withSuccessHandler: (fn: (result: unknown) => void) => typeof google.script.run;
      withFailureHandler: (fn: (error: Error) => void) => typeof google.script.run;
    };
  };
};

export class GasApiClient implements ApiClient {
  call<T>(functionName: string, ...args: unknown[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const runner = google.script.run
        .withSuccessHandler((result: unknown) => resolve(result as T))
        .withFailureHandler(reject);

      const fn = runner[functionName];
      if (typeof fn !== 'function') {
        reject(new Error(`Server function "${functionName}" not found`));
        return;
      }

      fn(...args);
    });
  }
}
