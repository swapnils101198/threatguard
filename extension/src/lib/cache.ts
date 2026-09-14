// extension/src/lib/cache.ts

import {
  CACHE_MAX_ENTRIES,
  CACHE_STORAGE_KEY,
  CACHE_TTL_MS,
} from './constants.js';
import type { ScanResult } from './types.js';

interface CacheEntry {
  result: ScanResult;
  timestamp: number;
}

type CacheMap = Record<string, CacheEntry>;

/**
 * Retrieve a cached scan result for a URL if it is still within TTL.
 * Returns null on miss or expiry.
 *
 * Note: chrome.storage.local is the source of truth. MV3 service workers
 * are torn down frequently, so in-memory state is unsafe to rely on.
 */
export async function getCached(url: string): Promise<ScanResult | null> {
  const stored = await chrome.storage.local.get(CACHE_STORAGE_KEY);
  const map = (stored[CACHE_STORAGE_KEY] as CacheMap | undefined) ?? {};
  const entry = map[url];

  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    // Expired — drop it so the map stays tidy.
    delete map[url];
    await chrome.storage.local.set({ [CACHE_STORAGE_KEY]: map });
    return null;
  }

  return entry.result;
}

/**
 * Store a scan result for a URL. Prunes the oldest entries when the map
 * exceeds CACHE_MAX_ENTRIES.
 */
export async function setCached(url: string, result: ScanResult): Promise<void> {
  const stored = await chrome.storage.local.get(CACHE_STORAGE_KEY);
  const map = (stored[CACHE_STORAGE_KEY] as CacheMap | undefined) ?? {};

  map[url] = { result, timestamp: Date.now() };

  const entries = Object.entries(map);
  if (entries.length > CACHE_MAX_ENTRIES) {
    entries
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, entries.length - CACHE_MAX_ENTRIES)
      .forEach(([key]) => {
        delete map[key];
      });
  }

  await chrome.storage.local.set({ [CACHE_STORAGE_KEY]: map });
}
