// Cache TTL in milliseconds. Results older than this are re-fetched.
export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Maximum number of URLs to keep in the cache. Oldest entries pruned first.
export const CACHE_MAX_ENTRIES = 200;

// chrome.storage key under which the URL cache lives.
export const CACHE_STORAGE_KEY = 'tg_url_cache';

// Per-request network timeout, in milliseconds.
export const API_TIMEOUT_MS = 6000;

// Risk score thresholds for verdict bucketing.
export const VERDICT_THRESHOLDS = {
  suspicious: 20,
  dangerous: 50,
} as const;

// Score contribution per source when flagged.
export const SOURCE_WEIGHTS = {
  'google-safe-browsing': 50,
  virustotal: 40,
  phishtank: 30,
  urlhaus: 35,
} as const;

/**
  Backend base URL. In dev, this points at the local Express proxy.
  In production, this is where the extension talks — API keys never ship in the extension bundle.
 */
export const BACKEND_BASE_URL = 'http://localhost:8787';
