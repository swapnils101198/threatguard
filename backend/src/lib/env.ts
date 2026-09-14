// backend/src/lib/env.ts

import 'dotenv/config';

/**
 * Typed, validated access to environment configuration.
 *
 * Policy:
 * - In development: missing API keys produce a warning and an empty string,
 *   so the server can boot and demonstrate graceful degradation when a
 *   threat source is unavailable. This is the behavior the assignment
 *   explicitly asks us to demonstrate.
 * - In production: missing API keys are a hard startup failure. Shipping
 *   a production build without keys would silently break threat lookups.
 */

export interface Env {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  GOOGLE_SAFE_BROWSING_API_KEY: string;
  VIRUSTOTAL_API_KEY: string;
  PHISHTANK_API_KEY: string;
  CACHE_TTL_SECONDS: number;
  CACHE_MAX_ENTRIES: number;
}

function parseNodeEnv(): Env['NODE_ENV'] {
  const v = process.env.NODE_ENV ?? 'development';
  if (v !== 'development' && v !== 'production' && v !== 'test') {
    throw new Error(`NODE_ENV must be development|production|test, got: ${v}`);
  }
  return v;
}

function optionalNumber(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`Env var ${key} must be a non-negative number, got: ${raw}`);
  }
  return n;
}

function apiKey(key: string, isProduction: boolean): string {
  const value = process.env[key];
  if (value && value.trim() !== '') return value;

  if (isProduction) {
    throw new Error(`Missing required env var: ${key}`);
  }

  console.warn(`[env] ${key} is not set — related threat source will be skipped`);
  return '';
}

export function loadEnv(): Env {
  const NODE_ENV = parseNodeEnv();
  const isProduction = NODE_ENV === 'production';

  return {
    PORT: optionalNumber('PORT', 8787),
    NODE_ENV,
    GOOGLE_SAFE_BROWSING_API_KEY: apiKey('GOOGLE_SAFE_BROWSING_API_KEY', isProduction),
    VIRUSTOTAL_API_KEY: apiKey('VIRUSTOTAL_API_KEY', isProduction),
    PHISHTANK_API_KEY: apiKey('PHISHTANK_API_KEY', isProduction),
    CACHE_TTL_SECONDS: optionalNumber('CACHE_TTL_SECONDS', 3600),
    CACHE_MAX_ENTRIES: optionalNumber('CACHE_MAX_ENTRIES', 500),
  };
}