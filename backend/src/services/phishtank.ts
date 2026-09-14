import type { ThreatService, ThreatSignal } from '../lib/types.js';

const ENDPOINT = 'https://checkurl.phishtank.com/checkurl/';
const TIMEOUT_MS = 6000;

interface PtResult {
  in_database?: boolean;
  valid?: boolean;
  phish_id?: string;
}

interface PtResponse {
  results?: PtResult;
}

export class PhishTankService implements ThreatService {
  readonly source = 'phishtank' as const;

  constructor(private readonly apiKey: string) { }

  async check(url: string): Promise<ThreatSignal> {
    const body = new URLSearchParams({
      url,
      format: 'json',
      app_key: this.apiKey,
    });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'ThreatGuard/0.1.0',
        },
        body: body.toString(),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`PhishTank responded ${res.status}`);
      }

      const data = (await res.json()) as PtResponse;
      const flagged = data.results?.in_database === true && data.results?.valid === true;

      return {
        source: this.source,
        flagged,
        ...(flagged && data.results?.phish_id
          ? { detail: `PhishTank ID ${data.results.phish_id}` }
          : {}),
      };
    } finally {
      clearTimeout(timer);
    }
  }
}