// extension/src/background/service-worker.ts

import { getCached, setCached } from '../lib/cache.js';
import { fetchThreatSignals } from '../lib/threat-apis.js';
import { scoreUrl } from '../lib/risk-scorer.js';
import type {
  ScanRequestMessage,
  ScanResponseMessage,
  ScanResult,
} from '../lib/types.js';

// =============================================================================
// Top-level listener registration (MV3 requirement).
//
// The service worker is torn down when idle and re-created on the next event.
// Listeners MUST be registered synchronously at the top level — if they're
// registered inside an async callback, they may never fire after a restart.
// =============================================================================

chrome.runtime.onMessage.addListener(
  (
    message: unknown,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ScanResponseMessage) => void
  ): boolean => {
    if (!isScanRequest(message)) return false;

    handleScan(message)
      .then((result) => {
        sendResponse({ type: 'SCAN_RESULT', result });
      })
      .catch((err: unknown) => {
        // Never leave the content script hanging — always respond.
        const fallback = safeFallback(message.url, err);
        sendResponse({ type: 'SCAN_RESULT', result: fallback });
      });

    // Return true to keep the message channel open for the async response.
    return true;
  }
);

// =============================================================================
// Core scan handler
// =============================================================================

async function handleScan(message: ScanRequestMessage): Promise<ScanResult> {
  const { url } = message;

  const cached = await getCached(url);
  if (cached) return cached;

  const signals = await fetchThreatSignals(url);
  const result = scoreUrl(url, signals);

  await setCached(url, result);
  return result;
}

// =============================================================================
// Helpers
// =============================================================================

function isScanRequest(value: unknown): value is ScanRequestMessage {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return v.type === 'SCAN_URL' && typeof v.url === 'string' && v.url.length > 0;
}

/**
 * If the backend is unreachable, we return a "safe" verdict with an empty
 * score rather than blocking the user on infrastructure failure. The
 * alternate design — warn on unreachability — produces too many false
 * positives for a consumer tool.
 */
function safeFallback(url: string, err: unknown): ScanResult {
  console.warn('[ThreatGuard] scan failed, failing open:', err);
  return {
    url,
    score: 0,
    verdict: 'safe',
    reasons: [],
    sourcesResponded: [],
    checkedAt: new Date().toISOString(),
  };
}