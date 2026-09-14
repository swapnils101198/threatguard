// Mirrors the extension's ThreatSource union. Keep in sync.
export type ThreatSource = 'google-safe-browsing' | 'virustotal' | 'phishtank' | 'urlhaus';

// One normalized signal from a single threat-intel provider.
export interface ThreatSignal {
  source: ThreatSource;
  flagged: boolean;
  detail?: string;
}

// Contract every threat-source service must satisfy.
export interface ThreatService {
  readonly source: ThreatSource;
  check(url: string): Promise<ThreatSignal>;
}