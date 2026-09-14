// backend/src/services/aggregator.ts

import type { ThreatService, ThreatSignal } from '../lib/types.js';

/**
 * Fan out to all threat services in parallel and return whichever signals
 * succeeded. Individual service failures are swallowed — a scan is always
 * served with whatever data was available, never rejected because one
 * provider is down.
 */
export class ThreatAggregator {
  constructor(private readonly services: ThreatService[]) {}

  async checkAll(url: string): Promise<ThreatSignal[]> {
    const settled = await Promise.allSettled(
      this.services.map((service) => service.check(url))
    );

    const signals: ThreatSignal[] = [];

    settled.forEach((result, idx) => {
      const service = this.services[idx];
      if (!service) return;

      if (result.status === 'fulfilled') {
        signals.push(result.value);
      } else {
        const reason =
          result.reason instanceof Error ? result.reason.message : String(result.reason);
        console.warn(`[aggregator] ${service.source} failed: ${reason}`);
        // Deliberately do NOT push a signal — the extension treats missing
        // sources as "unknown", not "clean".
      }
    });

    return signals;
  }
}