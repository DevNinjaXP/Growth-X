import path from 'node:path';
import crypto from 'node:crypto';
import { ValidationError } from '../errors.js';
import { ensureDir } from '../utils/fs.js';
import { normalizeLanguage } from '../utils/lang.js';
import { QualityValidator } from '../validation/quality.js';

export class VideoGenerationEngine {
  /**
   * @param {{
   *   speechSynthesizer?: { synthesize: Function } | null,
   *   avatarRenderer: { render: Function },
   *   qualityValidator?: QualityValidator,
   *   logger?: { info?: Function, warn?: Function, error?: Function },
   * }} deps
   */
  constructor({ speechSynthesizer = null, avatarRenderer, qualityValidator, logger } = {}) {
    if (!avatarRenderer) throw new ValidationError('avatarRenderer is required');

    this.speechSynthesizer = speechSynthesizer;
    this.avatarRenderer = avatarRenderer;
    this.qualityValidator = qualityValidator ?? new QualityValidator();
    this.logger = logger ?? console;
  }

  /**
   * @param {{
   *   text: string,
   *   language: string,
   *   outDir?: string,
   *   format?: 'mp4'|'webm',
   *   width?: number,
   *   height?: number,
   *   fps?: number,
   *   audioMode?: 'engine'|'provider',
   *   validateQuality?: boolean,
   *   qualityRequirements?: object,
   *   avatar?: {
   *     sourceImageUrl?: string,
   *     background?: { type: 'color'|'image', value: string } | null,
   *     clothing?: Record<string, unknown> | null,
   *     style?: Record<string, unknown> | null,
   *   },
   * }} request
   */
  async generate(request) {
    const {
      text,
      language,
      outDir = '.generated',
      format = 'mp4',
      width = 1920,
      height = 1080,
      fps = 30,
      audioMode = this.speechSynthesizer ? 'engine' : 'provider',
      validateQuality = true,
      qualityRequirements = {},
      avatar = {},
    } = request ?? {};

    if (!text?.trim()) throw new ValidationError('text is required');
    const lang = normalizeLanguage(language);

    if (format !== 'mp4' && format !== 'webm') {
      throw new ValidationError(`Unsupported output format: ${format}`);
    }

    const jobId = crypto.randomUUID();
    const jobDir = path.join(outDir, jobId);
    await ensureDir(jobDir);

    this.logger?.info?.(`[VideoGenerationEngine] job ${jobId} started (${lang}, ${format})`);

    let audio = null;
    if (audioMode === 'engine') {
      if (!this.speechSynthesizer) {
        throw new ValidationError('audioMode=engine requires a speechSynthesizer');
      }
      audio = await this.speechSynthesizer.synthesize({
        text,
        language: lang,
        outDir: jobDir,
      });
    }

    const renderResult = await this.avatarRenderer.render({
      text,
      language: lang,
      outDir: jobDir,
      format,
      width,
      height,
      fps,
      durationSeconds: audio?.durationSeconds ?? null,
      audioPath: audio?.audioPath ?? null,
      ...avatar,
    });

    const validationReport = validateQuality
      ? this.qualityValidator.validate(
          {
            width: renderResult.width ?? width,
            height: renderResult.height ?? height,
            fps: renderResult.fps ?? fps,
            durationSeconds: renderResult.durationSeconds ?? audio?.durationSeconds ?? null,
          },
          qualityRequirements,
        )
      : { ok: true, skipped: true };

    const outputPath = renderResult.videoPath;
    const outputFormat = inferFormat({ outputPath, mimeType: renderResult.mimeType }) ?? format;

    this.logger?.info?.(
      `[VideoGenerationEngine] job ${jobId} finished (requested=${format}, output=${outputFormat})`,
    );

    return {
      jobId,
      outputPath,
      requestedFormat: format,
      format: outputFormat,
      language: lang,
      mimeType: renderResult.mimeType ?? null,
      metadata: {
        width: renderResult.width ?? width,
        height: renderResult.height ?? height,
        fps: renderResult.fps ?? fps,
        durationSeconds: renderResult.durationSeconds ?? audio?.durationSeconds ?? null,
        audioPath: audio?.audioPath ?? null,
      },
      validation: validationReport,
      providerMetadata: renderResult.providerMetadata ?? null,
    };
  }
}

function inferFormat({ outputPath, mimeType }) {
  if (mimeType === 'video/mp4') return 'mp4';
  if (mimeType === 'video/webm') return 'webm';

  const ext = outputPath ? path.extname(outputPath).toLowerCase() : '';
  if (ext === '.mp4') return 'mp4';
  if (ext === '.webm') return 'webm';
  return null;
}
