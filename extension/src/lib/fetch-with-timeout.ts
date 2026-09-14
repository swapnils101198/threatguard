/**
  `fetch` with an AbortController-based timeout.
  MV3 service workers are killed aggressively. A hung fetch can block the whole worker past its idle budget, so every network call must be bounded.
 
  @throws {Error} If the request aborts due to timeout or the network fails.
 */
export async function fetchWithTimeout(input: string, init: RequestInit = {}, timeoutMs = 6000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${input}`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
