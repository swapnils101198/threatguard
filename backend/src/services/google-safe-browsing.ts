// backend/src/services/google-safe-browsing.ts

import type { ThreatService, ThreatSignal } from '../lib/types.js';

const ENDPOINT = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';
const TIMEOUT_MS = 5000;

interface GsbMatch {
  threatType: string;
}

interface GsbResponse {
  matches?: GsbMatch[];
}

export class GoogleSafeBrowsingService implements ThreatService {
  readonly source = 'google-safe-browsing' as const;

  constructor(private readonly apiKey: string) {}

  async check(url: string): Promise<ThreatSignal> {
    const body = {
      client: { clientId: 'threatguard', clientVersion: '0.1.0' },
      threatInfo: {
        threatTypes: [
          'MALWARE',
          'SOCIAL_ENGINEERING',
          'UNWANTED_SOFTWARE',
          'POTENTIALLY_HARMFUL_APPLICATION',
        ],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: [{ url }],
      },
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${ENDPOINT}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Safe Browsing responded ${res.status}`);
      }

      const data = (await res.json()) as GsbResponse;
      const matched = Array.isArray(data.matches) && data.matches.length > 0;

      return {
        source: this.source,
        flagged: matched,
        ...(matched && data.matches?.[0]?.threatType
          ? { detail: data.matches[0].threatType }
          : {}),
      };
    } finally {
      clearTimeout(timer);
    }
  }
}