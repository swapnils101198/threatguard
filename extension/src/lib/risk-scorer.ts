// extension/src/lib/risk-scorer.ts

import { SOURCE_WEIGHTS, VERDICT_THRESHOLDS } from './constants.js';
import type { ScanResult, ThreatSignal, ThreatSource, Verdict } from './types.js';

/**
 * Combine normalized threat signals into a 0–100 risk score and a verdict.
 *
 * Design notes:
 * - Sources are weighted (Safe Browsing is the strongest signal, PhishTank
 *   the most conservative).
 * - Sources that didn't respond are excluded from `sourcesResponded` so the
 *   UI can distinguish "clean" from "unknown".
 * - The score is capped at 100.
 * - The verdict is bucketed by VERDICT_THRESHOLDS.
 */
export function scoreUrl(url: string, signals: ThreatSignal[]): ScanResult {
  const responded: ThreatSource[] = [];
  const reasons: string[] = [];
  let score = 0;

  for (const signal of signals) {
    responded.push(signal.source);

    if (!signal.flagged) continue;

    score += SOURCE_WEIGHTS[signal.source];

    reasons.push(buildReason(signal));
  }

  const cappedScore = Math.min(score, 100);

  return {
    url,
    score: cappedScore,
    verdict: bucketVerdict(cappedScore),
    reasons,
    sourcesResponded: responded,
    checkedAt: new Date().toISOString(),
  };
}

function bucketVerdict(score: number): Verdict {
  if (score >= VERDICT_THRESHOLDS.dangerous) return 'dangerous';
  if (score >= VERDICT_THRESHOLDS.suspicious) return 'suspicious';
  return 'safe';
}

function buildReason(signal: ThreatSignal): string {
  const label = SOURCE_LABELS[signal.source];
  if (signal.detail) {
    return `${label}: ${signal.detail}`;
  }
  return `${label}: flagged this URL`;
}

const SOURCE_LABELS: Record<ThreatSource, string> = {
  'google-safe-browsing': 'Google Safe Browsing',
  virustotal: 'VirusTotal',
  phishtank: 'PhishTank',
};