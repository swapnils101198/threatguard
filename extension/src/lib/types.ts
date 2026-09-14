// extension/src/lib/types.ts

/** Which threat-intelligence source a signal came from. */
export type ThreatSource = 'google-safe-browsing' | 'virustotal' | 'phishtank' | 'urlhaus';
/** Normalized result from a single threat-intel provider. */
export interface ThreatSignal {
  /** Which provider produced this signal. */
  source: ThreatSource;
  /** Did the provider flag this URL as malicious? */
  flagged: boolean;
  /** Provider-specific detail (e.g. VirusTotal detection count). */
  detail?: string;
}

/** Verdict tiers, ordered from safest to most dangerous. */
export type Verdict = 'safe' | 'suspicious' | 'dangerous';

/** The final result returned from the background to the content script. */
export interface ScanResult {
  /** The URL that was scanned. */
  url: string;
  /** 0–100 risk score, higher = more dangerous. */
  score: number;
  /** Bucketed verdict derived from the score. */
  verdict: Verdict;
  /** Human-readable reasons, one per flagged source. */
  reasons: string[];
  /** Which sources actually responded (nulls excluded). */
  sourcesResponded: ThreatSource[];
  /** ISO timestamp of when the scan completed. */
  checkedAt: string;
}

/** Message shape sent from content script → service worker. */
export interface ScanRequestMessage {
  type: 'SCAN_URL';
  url: string;
}

/** Message shape sent from service worker → content script. */
export interface ScanResponseMessage {
  type: 'SCAN_RESULT';
  result: ScanResult;
}