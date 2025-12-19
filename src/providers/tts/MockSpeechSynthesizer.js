import path from 'node:path';
import crypto from 'node:crypto';
import { ValidationError } from '../../errors.js';
import { ensureDir, writeFile } from '../../utils/fs.js';
import { normalizeLanguage } from '../../utils/lang.js';

export class MockSpeechSynthesizer {
  constructor({ wordsPerMinute = 150 } = {}) {
    this.wordsPerMinute = wordsPerMinute;
  }

  /**
   * @param {{ text: string, language: string, outDir: string }} params
   * @returns {Promise<{ audioPath: string, mimeType: string, durationSeconds: number }>} 
   */
  async synthesize({ text, language, outDir }) {
    if (!text?.trim()) throw new ValidationError('text is required');
    normalizeLanguage(language);

    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const durationSeconds = Math.max(1, Math.round((words / this.wordsPerMinute) * 60));

    await ensureDir(outDir);
    const audioPath = path.join(outDir, `tts-mock-${crypto.randomUUID()}.wav`);

    const wav = buildSineWaveWav({ durationSeconds, sampleRate: 24000, frequencyHz: 220 });
    await writeFile(audioPath, wav);

    return { audioPath, mimeType: 'audio/wav', durationSeconds };
  }
}

function buildSineWaveWav({ durationSeconds, sampleRate, frequencyHz }) {
  const numSamples = Math.floor(durationSeconds * sampleRate);
  const bytesPerSample = 2;
  const blockAlign = 1 * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * bytesPerSample;

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34); // bits
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  const data = Buffer.alloc(dataSize);
  const amplitude = 0.15 * 0x7fff;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.round(amplitude * Math.sin(2 * Math.PI * frequencyHz * t));
    data.writeInt16LE(sample, i * 2);
  }

  return Buffer.concat([header, data]);
}
