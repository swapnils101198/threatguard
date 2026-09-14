import type { ThreatService, ThreatSignal } from '../lib/types.js';

const ENDPOINT = 'https://urlhaus-api.abuse.ch/v1/url/';
const TIMEOUT_MS = 6000;

interface UrlhausResponse {
  query_status: 'is_listed' | 'not_listed' | 'no_results' | 'invalid_url';
  url?: string;
  urlhaus_reference?: string;
  threat?: string;
  tags?: string[] | null;
}

export class UrlhausService implements ThreatService {
  readonly source = 'urlhaus' as const;

  constructor(private readonly authKey: string) { }

  async check(url: string): Promise<ThreatSignal> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Auth-Key': this.authKey,
        },
        body: `url=${encodeURIComponent(url)}`,
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`URLhaus responded ${res.status}`);
      }

      const data = (await res.json()) as UrlhausResponse;

      const flagged = data.query_status === 'is_listed';

      return {
        source: this.source,
        flagged,
        ...(flagged && data.threat
          ? { detail: data.threat }
          : {}),
      };
    } finally {
      clearTimeout(timer);
    }
  }
}