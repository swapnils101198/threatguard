// backend/src/index.ts

import express from 'express';
import cors from 'cors';

import { loadEnv } from './lib/env.js';
import { TtlCache } from './lib/cache.js';
import { GoogleSafeBrowsingService } from './services/google-safe-browsing.js';
import { VirusTotalService } from './services/virustotal.js';
import { PhishTankService } from './services/phishtank.js';
import { ThreatAggregator } from './services/aggregator.js';
import { createCheckUrlRouter } from './routes/check-url.js';
import type { ThreatSignal } from './lib/types.js';

interface CachedPayload {
  signals: ThreatSignal[];
}

function main(): void {
  const env = loadEnv();

  const services = [
    new GoogleSafeBrowsingService(env.GOOGLE_SAFE_BROWSING_API_KEY),
    new VirusTotalService(env.VIRUSTOTAL_API_KEY),
    new PhishTankService(env.PHISHTANK_API_KEY),
  ];

  const aggregator = new ThreatAggregator(services);
  const cache = new TtlCache<CachedPayload>(
    env.CACHE_TTL_SECONDS * 1000,
    env.CACHE_MAX_ENTRIES
  );

  const app = express();

  app.use(cors({ origin: true }));
  app.use(express.json({ limit: '4kb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, cacheSize: cache.size() });
  });

  app.use('/api', createCheckUrlRouter(aggregator, cache));

  app.listen(env.PORT, () => {
    console.log(`[threatguard-backend] listening on http://localhost:${env.PORT}`);
    console.log(`[threatguard-backend] env: ${env.NODE_ENV}`);
  });
}

try {
  main();
} catch (err) {
  console.error('[threatguard-backend] fatal:', err);
  process.exit(1);
}