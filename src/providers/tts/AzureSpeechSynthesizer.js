import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { ProviderError, ValidationError } from '../../errors.js';
import { ensureDir } from '../../utils/fs.js';
import { fetchWithRetry } from '../../utils/http.js';
import { normalizeLanguage } from '../../utils/lang.js';

const DEFAULT_VOICE_BY_LANG = {
  en: 'en-US-JennyNeural',
  es: 'es-ES-ElviraNeural',
  zh: 'zh-CN-XiaoxiaoNeural',
  fr: 'fr-FR-DeniseNeural',
};

export class AzureSpeechSynthesizer {
  /**
   * @param {{ key?: string, region?: string, voiceByLang?: Partial<typeof DEFAULT_VOICE_BY_LANG> }} opts
   */
  constructor({
    key = process.env.AZURE_SPEECH_KEY,
    region = process.env.AZURE_SPEECH_REGION,
    voiceByLang = {},
  } = {}) {
    if (!key) throw new ValidationError('AZURE_SPEECH_KEY is required for AzureSpeechSynthesizer');
    if (!region) {
      throw new ValidationError('AZURE_SPEECH_REGION is required for AzureSpeechSynthesizer');
    }

    this.key = key;
    this.region = region;
    this.voiceByLang = { ...DEFAULT_VOICE_BY_LANG, ...voiceByLang };
  }

  /**
   * @param {{ text: string, language: string, voice?: string, outDir: string }} params
   * @returns {Promise<{ audioPath: string, mimeType: string, durationSeconds: number | null }>} 
   */
  async synthesize({ text, language, voice, outDir }) {
    if (!text?.trim()) throw new ValidationError('text is required');
    const lang = normalizeLanguage(language);

    const voiceId = voice ?? this.voiceByLang[lang];
    if (!voiceId) throw new ValidationError(`No Azure voice configured for language ${lang}`);

    await ensureDir(outDir);
    const audioPath = path.join(outDir, `tts-${crypto.randomUUID()}.mp3`);

    const ssml = `<?xml version="1.0" encoding="utf-8"?>
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">
  <voice name="${voiceId}">
    <prosody rate="0%" pitch="0%">${escapeXml(text)}</prosody>
  </voice>
</speak>`;

    const url = `https://${this.region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const res = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'growthx-ai-video-engine',
      },
      body: ssml,
      retries: 3,
    });

    if (!res.ok) {
      const body = await safeText(res);
      throw new ProviderError(`Azure TTS failed: HTTP ${res.status} ${body}`);
    }

    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(audioPath, buf);

    return { audioPath, mimeType: 'audio/mpeg', durationSeconds: null };
  }
}

function escapeXml(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return '';
  }
}
