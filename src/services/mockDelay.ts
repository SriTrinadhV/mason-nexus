// Simulates network latency so loading states are visible in the prototype.
// In production this file disappears entirely — real services would return real promises.
export function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}
