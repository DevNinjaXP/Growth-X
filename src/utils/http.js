import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

/**
 * @param {string} url
 * @param {RequestInit & { retries?: number, retryDelayMs?: number, retryOn?: (res: Response | Error) => boolean }} [init]
 */
export async function fetchWithRetry(url, init = {}) {
  const { retries = 3, retryDelayMs = 500, retryOn, ...fetchInit } = init;

  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, fetchInit);
      const shouldRetry = retryOn
        ? retryOn(res)
        : !res.ok && [408, 409, 425, 429, 500, 502, 503, 504].includes(res.status);

      if (!shouldRetry) return res;

      lastErr = new Error(`HTTP ${res.status} from ${url}`);
    } catch (err) {
      const shouldRetry = retryOn ? retryOn(err) : true;
      if (!shouldRetry) throw err;
      lastErr = err;
    }

    if (attempt < retries) {
      await sleep(retryDelayMs * Math.pow(2, attempt));
    }
  }

  throw lastErr;
}

/**
 * Downloads a URL to a local file.
 * @param {string} url
 * @param {string} outPath
 */
export async function downloadToFile(url, outPath) {
  const res = await fetchWithRetry(url, { retries: 3 });
  if (!res.ok) throw new Error(`Failed to download ${url}: HTTP ${res.status}`);

  const body = res.body;
  if (!body) throw new Error(`No response body while downloading ${url}`);

  await fsp.mkdir(path.dirname(outPath), { recursive: true });
  await pipeline(Readable.fromWeb(body), fs.createWriteStream(outPath));
}
