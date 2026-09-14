// backend/src/services/virustotal.ts

import type { ThreatService, ThreatSignal } from '../lib/types.js';

const SUBMIT_ENDPOINT = 'https://www.virustotal.com/api/v3/urls';
const REPORT_ENDPOINT = 'https://www.virustotal.com/api/v3/analyses';
const TIMEOUT_MS = 8000;
const POLL_DELAY_MS = 2000;

interface VtSubmitResponse {
  data?: { id?: string };
}

interface VtStats {
  malicious?: number;
  suspicious?: number;
  harmless?: number;
  undetected?: number;
  timeout?: number;
}

interface VtReportResponse {
  data?: {
    attributes?: {
      status?: string;
      stats?: VtStats;
    };
  };
}

export class VirusTotalService implements ThreatService {
  readonly source = 'virustotal' as const;

  constructor(private readonly apiKey: string) {}

  async check(url: string): Promise<ThreatSignal> {
    const analysisId = await this.submit(url);
    await delay(POLL_DELAY_MS);
    const report = await this.fetchReport(analysisId);

    const stats = report.data?.attributes?.stats ?? {};
    const malicious = (stats.malicious ?? 0) + (stats.suspicious ?? 0);
    const flagged = malicious > 0;

    return {
      source: this.source,
      flagged,
      ...(flagged ? { detail: `${malicious} engine(s) flagged this URL` } : {}),
    };
  }

  private async submit(url: string): Promise<string> {
    const res = await fetchWithTimeout(
      SUBMIT_ENDPOINT,
      {
        method: 'POST',
        headers: {
          'x-apikey': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `url=${encodeURIComponent(url)}`,
      },
      TIMEOUT_MS
    );

    if (!res.ok) {
      throw new Error(`VirusTotal submit responded ${res.status}`);
    }

    const data = (await res.json()) as VtSubmitResponse;
    const id = data.data?.id;
    if (!id) {
      throw new Error('VirusTotal submit returned no analysis id');
    }
    return id;
  }

  private async fetchReport(analysisId: string): Promise<VtReportResponse> {
    const res = await fetchWithTimeout(
      `${REPORT_ENDPOINT}/${analysisId}`,
      { headers: { 'x-apikey': this.apiKey } },
      TIMEOUT_MS
    );

    if (!res.ok) {
      throw new Error(`VirusTotal report responded ${res.status}`);
    }

    return (await res.json()) as VtReportResponse;
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}