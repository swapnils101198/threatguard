import type { ScanRequestMessage, ScanResponseMessage, ScanResult } from '../lib/types.js';

type Verdict = 'idle' | 'scanning' | 'safe' | 'suspicious' | 'dangerous' | 'error';

const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const els = {
  body: document.body,
  status: el<HTMLSpanElement>('tg-status'),
  mark: el<HTMLDivElement>('tg-mark'),
  label: el<HTMLDivElement>('tg-label'),
  sources: el<HTMLSpanElement>('tg-sources'),
  score: el<HTMLSpanElement>('tg-score'),
  url: el<HTMLDivElement>('tg-url'),
  reasons: el<HTMLUListElement>('tg-reasons'),
  rescan: el<HTMLButtonElement>('tg-rescan'),
};

const ICON: Record<Verdict, string> = {
  idle: '—', scanning: '…', safe: '✓', suspicious: '!', dangerous: '✕', error: '!',
};

const TITLE: Record<Verdict, string> = {
  idle: 'Idle', scanning: 'Scanning…', safe: 'No threats found',
  suspicious: 'Suspicious site', dangerous: 'Dangerous site', error: 'Scan failed',
};

void init();

async function init(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url;

  if (!url || !/^https?:/.test(url)) {
    els.url.textContent = 'Not a scannable page.';
    els.rescan.disabled = true;
    setState('idle', { title: 'Unavailable', sources: 'no URL to scan' });
    return;
  }

  els.url.textContent = url;
  els.url.title = url;
  els.rescan.addEventListener('click', () => void scan(url));
  await scan(url);
}

function scan(url: string): Promise<void> {
  setState('scanning', { sources: 'checking sources' });
  els.reasons.replaceChildren();

  return new Promise((resolve) => {
    const message: ScanRequestMessage = { type: 'SCAN_URL', url };

    chrome.runtime.sendMessage(message, (response: unknown) => {
      if (chrome.runtime.lastError || !isScanResponse(response)) {
        setState('error', { title: 'Service unreachable', sources: 'scan failed' });
        resolve();
        return;
      }
      render(response.result);
      resolve();
    });
  });
}

function render(result: ScanResult): void {
  const n = result.sourcesResponded.length;
  setState(result.verdict, {
    sources: n === 0 ? 'No sources responded' : `${n} source${n === 1 ? '' : 's'} checked`,
    score: `${result.score}/100`,
  });

  for (const reason of result.reasons) {
    const li = document.createElement('li');
    li.textContent = reason;
    els.reasons.appendChild(li);
  }
}

interface StateOverrides {
  title?: string;
  sources?: string;
  score?: string;
}

function setState(state: Verdict, o: StateOverrides = {}): void {
  els.body.dataset.verdict = state;
  els.mark.textContent = ICON[state];
  els.label.textContent = o.title ?? TITLE[state];
  els.status.textContent = TITLE[state].replace('…', '');
  if (o.sources !== undefined) els.sources.textContent = o.sources;
  if (o.score !== undefined) els.score.textContent = o.score;
}

function isScanResponse(value: unknown): value is ScanResponseMessage {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return v.type === 'SCAN_RESULT' && typeof v.result === 'object' && v.result !== null;
}