
import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ThreatAggregator } from '../services/aggregator.js';
import type { TtlCache } from '../lib/cache.js';
import type { ThreatSignal } from '../lib/types.js';

interface CheckBody {
  url: string;
}

interface CachedPayload {
  signals: ThreatSignal[];
}

// TEMP DEMO FLAG — set to false to restore real threat lookups. const DEMO_MODE = true;
const DEMO_MODE = false;

export function createCheckUrlRouter(aggregator: ThreatAggregator, cache: TtlCache<CachedPayload>): Router {
  const router = Router();

  router.post('/check-url', async (req: Request, res: Response) => {
    const body = req.body as Partial<CheckBody>;

    if (typeof body.url !== 'string' || !isHttpUrl(body.url)) {
      res.status(400).json({ error: 'A valid http(s) URL is required' });
      return;
    }

    const url = body.url;

    const cached = cache.get(url);
    if (cached) {
      res.json({ signals: cached.signals, cached: true });
      return;
    }

    if (DEMO_MODE) {
      const demoSignals: ThreatSignal[] = [
        { source: 'google-safe-browsing', flagged: true, detail: 'SOCIAL_ENGINEERING' },
      ];
      cache.set(url, { signals: demoSignals });
      res.json({ signals: demoSignals, cached: false });
      return;
    }

    try {
      const signals = await aggregator.checkAll(url);
      cache.set(url, { signals });
      res.json({ signals, cached: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error';
      console.error('[check-url] aggregator failed:', message);
      res.status(500).json({ error: 'Threat lookup failed' });
    }
  });

  return router;
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}