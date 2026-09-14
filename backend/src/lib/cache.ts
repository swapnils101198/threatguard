
/**
 Minimal in-memory TTL cache.

 A production deployment would use Redis, but for a single-process MVP this is correct and dependency-free. The interface is deliberately narrow so swapping in Redis later is a one-file change.
 */

interface Entry<V> {
  value: V;
  expiresAt: number;
}

export class TtlCache<V> {
  private readonly store = new Map<string, Entry<V>>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries: number
  ) { }

  get(key: string): V | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: V): void {
    if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) this.store.delete(oldestKey);
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  size(): number {
    return this.store.size;
  }
}