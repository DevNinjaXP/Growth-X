import { QualityError } from '../errors.js';

export const DEFAULT_QUALITY_REQUIREMENTS = {
  minWidth: 1920,
  minHeight: 1080,
  minFps: 24,
  maxFps: 30,
  minDurationSeconds: 60,
};

/**
 * A provider-agnostic quality validator.
 *
 * By default it validates based on the metadata returned by providers.
 * If you add an ffprobe-based inspector later, you can feed the probed
 * values into the same validator.
 */
export class QualityValidator {
  /**
   * @param {{ width?: number, height?: number, fps?: number, durationSeconds?: number }} actual
   * @param {Partial<typeof DEFAULT_QUALITY_REQUIREMENTS>} requirements
   */
  validate(actual, requirements = {}) {
    const req = { ...DEFAULT_QUALITY_REQUIREMENTS, ...requirements };

    if (actual.width != null && actual.width < req.minWidth) {
      throw new QualityError(`Video width ${actual.width} is below required ${req.minWidth}`);
    }
    if (actual.height != null && actual.height < req.minHeight) {
      throw new QualityError(`Video height ${actual.height} is below required ${req.minHeight}`);
    }
    if (actual.fps != null && actual.fps < req.minFps) {
      throw new QualityError(`Video fps ${actual.fps} is below required ${req.minFps}`);
    }
    if (actual.fps != null && actual.fps > req.maxFps) {
      throw new QualityError(`Video fps ${actual.fps} exceeds maximum ${req.maxFps}`);
    }
    if (actual.durationSeconds != null && actual.durationSeconds < req.minDurationSeconds) {
      throw new QualityError(
        `Video duration ${actual.durationSeconds}s is below required ${req.minDurationSeconds}s`,
      );
    }

    return {
      ok: true,
      requirements: req,
      actual,
    };
  }
}
