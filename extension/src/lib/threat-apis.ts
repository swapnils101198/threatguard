import { API_TIMEOUT_MS, BACKEND_BASE_URL } from './constants.js';
import { fetchWithTimeout } from './fetch-with-timeout.js';
import type { ThreatSignal, ThreatSource } from './types.js';

// Backend response shape. The backend is the only component that holds API keys — the extension never sees them.
interface BackendCheckResponse {
  signals: ThreatSignal[];
}

/**
  Ask the backend to check a URL against all configured threat sources.
 
  The backend fans out to Google Safe Browsing, VirusTotal, and PhishTank in parallel and returns a normalized list of signals. It always responds
  200 with whatever sources succeeded; per-source failures are represented as missing signals, not as HTTP errors.
 
  @throws {Error} Only on network failure or malformed response shape.
 */
export async function fetchThreatSignals(url: string): Promise<ThreatSignal[]> {
  const endpoint = `${BACKEND_BASE_URL}/api/check-url`;

  const response = await fetchWithTimeout(
    endpoint,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    },
    API_TIMEOUT_MS
  );

  if (!response.ok) {
    throw new Error(`Backend responded ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as unknown;

  if (!isBackendCheckResponse(data)) {
    throw new Error('Backend returned malformed response');
  }

  return data.signals;
}

// Runtime type guard for the backend response. Treats all network data as untrusted.
function isBackendCheckResponse(value: unknown): value is BackendCheckResponse {
  if (typeof value !== 'object' || value === null) return false;
  const signals = (value as { signals?: unknown }).signals;
  if (!Array.isArray(signals)) return false;

  return signals.every((s) => isThreatSignal(s));
}

const VALID_SOURCES: readonly ThreatSource[] = [
  'google-safe-browsing',
  'virustotal',
  'phishtank',
  'urlhaus',
];

function isThreatSignal(value: unknown): value is ThreatSignal {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;

  if (typeof v.source !== 'string') return false;
  if (!VALID_SOURCES.includes(v.source as ThreatSource)) return false;
  if (typeof v.flagged !== 'boolean') return false;
  if (v.detail !== undefined && typeof v.detail !== 'string') return false;

  return true;
}