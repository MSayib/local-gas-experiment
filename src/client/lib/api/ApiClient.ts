/**
 * ApiClient — Interface for client-server communication.
 *
 * React components use this abstraction to call backend functions.
 * The runtime environment determines which implementation is used:
 * - LocalApiClient (fetch) for local dev
 * - GasApiClient (google.script.run) for GAS production
 */

export interface ApiClient {
  call<T>(functionName: string, ...args: unknown[]): Promise<T>;
}
