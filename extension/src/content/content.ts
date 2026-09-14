// extension/src/content/content.ts

import type {
  ScanRequestMessage,
  ScanResponseMessage,
  ScanResult,
} from '../lib/types.js';

// Guard against double-injection on SPA navigations.
if (!(window as unknown as { __tgInjected?: boolean }).__tgInjected) {
  (window as unknown as { __tgInjected?: boolean }).__tgInjected = true;
  run();
}

function run(): void {
  const url = window.location.href;

  // Skip internal browser pages.
  if (!/^https?:/.test(url)) return;

  const message: ScanRequestMessage = { type: 'SCAN_URL', url };

  chrome.runtime.sendMessage(message, (response: unknown) => {
    if (chrome.runtime.lastError) {
      console.warn('[ThreatGuard] message failed:', chrome.runtime.lastError.message);
      return;
    }
    if (!isScanResponse(response)) return;
    if (response.result.verdict === 'safe') return;

    renderWarning(response.result);
  });
}

function isScanResponse(value: unknown): value is ScanResponseMessage {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return v.type === 'SCAN_RESULT' && typeof v.result === 'object' && v.result !== null;
}

// =============================================================================
// Warning overlay
//
// Built with createElement + textContent, never innerHTML. Threat-data strings
// come from external APIs and MUST be treated as untrusted.
// =============================================================================

function renderWarning(result: ScanResult): void {
  if (document.getElementById('tg-overlay')) return;

  const overlay = el('div', { id: 'tg-overlay', class: `tg-overlay tg-${result.verdict}` });
  const card = el('div', { class: 'tg-card' });

  card.appendChild(el('div', { class: 'tg-icon' }, result.verdict === 'dangerous' ? '⛔' : '⚠️'));
  card.appendChild(el('h2', { class: 'tg-title' },
    result.verdict === 'dangerous' ? 'Dangerous site' : 'Suspicious site'
  ));
  card.appendChild(el('p', { class: 'tg-subtitle' },
    `Risk score ${result.score}/100`
  ));

  if (result.reasons.length > 0) {
    const list = el('ul', { class: 'tg-reasons' });
    for (const reason of result.reasons) {
      list.appendChild(el('li', {}, reason));
    }
    card.appendChild(list);
  }

  const actions = el('div', { class: 'tg-actions' });

  const proceed = el('button', { class: 'tg-btn tg-btn-proceed' }, 'Proceed anyway');
  proceed.addEventListener('click', () => overlay.remove());

  const leave = el('button', { class: 'tg-btn tg-btn-leave' }, 'Go back');
  leave.addEventListener('click', () => {
    if (history.length > 1) history.back();
    else window.close();
  });

  actions.appendChild(proceed);
  actions.appendChild(leave);
  card.appendChild(actions);
  overlay.appendChild(card);

  document.body.appendChild(overlay);
}

/**
 * Tiny typed createElement helper. Keeps the DOM-building code readable
 * without ever touching innerHTML.
 */
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  if (text !== undefined) node.textContent = text;
  return node;
}