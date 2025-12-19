import { ValidationError } from '../errors.js';

export const SUPPORTED_LANGUAGES = /** @type {const} */ ([
  'en',
  'es',
  'zh',
  'fr',
]);

/**
 * Normalizes language tags like en-US -> en.
 * @param {string} language
 */
export function normalizeLanguage(language) {
  if (!language) throw new ValidationError('language is required');
  const primary = language.toLowerCase().split(/[-_]/)[0];
  if (!SUPPORTED_LANGUAGES.includes(primary)) {
    throw new ValidationError(`Unsupported language: ${language}`);
  }
  return primary;
}
