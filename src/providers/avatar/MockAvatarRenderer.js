import path from 'node:path';
import crypto from 'node:crypto';
import { ValidationError } from '../../errors.js';
import { ensureDir, writeFile } from '../../utils/fs.js';

export class MockAvatarRenderer {
  /**
   * @param {{ fixedDurationSeconds?: number }} opts
   */
  constructor({ fixedDurationSeconds = 60 } = {}) {
    this.fixedDurationSeconds = fixedDurationSeconds;
  }

  /**
   * @param {{
   *   text: string,
   *   language: string,
   *   outDir: string,
   *   format?: 'mp4'|'webm',
   *   width?: number,
   *   height?: number,
   *   fps?: number,
   *   durationSeconds?: number | null,
   * }} params
   */
  async render({
    text,
    language,
    outDir,
    format = 'mp4',
    width = 1920,
    height = 1080,
    fps = 30,
    durationSeconds = null,
  }) {
    if (!text?.trim()) throw new ValidationError('text is required');
    if (!language) throw new ValidationError('language is required');

    await ensureDir(outDir);

    const videoPath = path.join(outDir, `mock-avatar-${crypto.randomUUID()}.${format}`);

    const effectiveDurationSeconds = durationSeconds ?? this.fixedDurationSeconds;

    const payload = {
      mock: true,
      message:
        'This is a mock video placeholder (not a real playable MP4/WebM). Use a real renderer provider in production.',
      width,
      height,
      fps,
      durationSeconds: effectiveDurationSeconds,
      language,
      previewText: text.slice(0, 80),
    };

    await writeFile(videoPath, Buffer.from(JSON.stringify(payload, null, 2)));

    return {
      videoPath,
      width,
      height,
      fps,
      durationSeconds: effectiveDurationSeconds,
      mimeType: format === 'webm' ? 'video/webm' : 'video/mp4',
    };
  }
}
