import path from 'node:path';
import crypto from 'node:crypto';
import { ProviderError, ValidationError } from '../../errors.js';
import { ensureDir } from '../../utils/fs.js';
import { downloadToFile, fetchWithRetry } from '../../utils/http.js';
import { normalizeLanguage } from '../../utils/lang.js';

const API_BASE = 'https://api.d-id.com';

const DEFAULT_VOICE_BY_LANG = {
  en: 'en-US-JennyNeural',
  es: 'es-ES-ElviraNeural',
  zh: 'zh-CN-XiaoxiaoNeural',
  fr: 'fr-FR-DeniseNeural',
};

export class DidAvatarRenderer {
  /**
   * @param {{ apiKey?: string, voiceByLang?: Partial<typeof DEFAULT_VOICE_BY_LANG>, maxWaitMs?: number, pollIntervalMs?: number }} opts
   */
  constructor({
    apiKey = process.env.DID_API_KEY,
    voiceByLang = {},
    maxWaitMs = 10 * 60_000,
    pollIntervalMs = 2000,
  } = {}) {
    if (!apiKey) throw new ValidationError('DID_API_KEY is required for DidAvatarRenderer');

    this.apiKey = apiKey;
    this.voiceByLang = { ...DEFAULT_VOICE_BY_LANG, ...voiceByLang };
    this.maxWaitMs = maxWaitMs;
    this.pollIntervalMs = pollIntervalMs;
  }

  /**
   * Render a talking-head video.
   *
   * D-ID supports provider-integrated TTS (recommended here so the engine does not need to host audio files publicly).
   * @param {{
   *   sourceImageUrl: string,
   *   text: string,
   *   language: string,
   *   voice?: string,
   *   outDir: string,
   *   format?: 'mp4'|'webm',
   *   width?: number,
   *   height?: number,
   *   fps?: number,
   *   background?: { type: 'color'|'image', value: string } | null,
   * }} params
   */
  async render({
    sourceImageUrl,
    text,
    language,
    voice,
    outDir,
    format = 'mp4',
    width = 1920,
    height = 1080,
    fps = 30,
    background = null,
  }) {
    if (!sourceImageUrl) throw new ValidationError('sourceImageUrl is required');
    if (!text?.trim()) throw new ValidationError('text is required');

    const lang = normalizeLanguage(language);
    const voiceId = voice ?? this.voiceByLang[lang];

    await ensureDir(outDir);

    const authHeader = makeDidAuthHeader(this.apiKey);

    const talkBody = {
      source_url: sourceImageUrl,
      script: {
        type: 'text',
        input: text,
        provider: {
          type: 'microsoft',
          voice_id: voiceId,
        },
      },
      config: {
        stitch: true,
      },
    };

    if (background?.type === 'color') {
      talkBody.config.background = { color: background.value };
    }
    if (background?.type === 'image') {
      talkBody.config.background = { source_url: background.value };
    }

    const res = await fetchWithRetry(`${API_BASE}/talks`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(talkBody),
      retries: 3,
    });

    if (!res.ok) {
      const body = await safeText(res);
      throw new ProviderError(`D-ID create talk failed: HTTP ${res.status} ${body}`);
    }

    const created = await res.json();
    const talkId = created.id;
    if (!talkId) throw new ProviderError('D-ID did not return a talk id');

    const talk = await this.#waitForTalk(talkId, authHeader);
    if (talk.status !== 'done') {
      throw new ProviderError(`D-ID talk ended with status ${talk.status}`);
    }

    const resultUrl = talk.result_url;
    if (!resultUrl) throw new ProviderError('D-ID did not return result_url');

    const outputPath = path.join(outDir, `avatar-${crypto.randomUUID()}.${format}`);
    await downloadToFile(resultUrl, outputPath);

    return {
      videoPath: outputPath,
      width,
      height,
      fps,
      durationSeconds: null,
      mimeType: format === 'webm' ? 'video/webm' : 'video/mp4',
    };
  }

  async #waitForTalk(talkId, authHeader) {
    const startedAt = Date.now();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const res = await fetchWithRetry(`${API_BASE}/talks/${talkId}`, {
        headers: { Authorization: authHeader },
        retries: 3,
      });

      if (!res.ok) {
        const body = await safeText(res);
        throw new ProviderError(`D-ID get talk failed: HTTP ${res.status} ${body}`);
      }

      const talk = await res.json();
      if (talk.status === 'done' || talk.status === 'error' || talk.status === 'rejected') {
        return talk;
      }

      if (Date.now() - startedAt > this.maxWaitMs) {
        throw new ProviderError(`Timed out waiting for D-ID talk ${talkId}`);
      }

      await new Promise((r) => setTimeout(r, this.pollIntervalMs));
    }
  }
}

function makeDidAuthHeader(apiKey) {
  const token = Buffer.from(`${apiKey}:`).toString('base64');
  return `Basic ${token}`;
}

async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return '';
  }
}
