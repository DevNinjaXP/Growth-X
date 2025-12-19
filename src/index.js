export { VideoGenerationEngine } from './engine/VideoGenerationEngine.js';

export { AzureSpeechSynthesizer } from './providers/tts/AzureSpeechSynthesizer.js';
export { MockSpeechSynthesizer } from './providers/tts/MockSpeechSynthesizer.js';

export { DidAvatarRenderer } from './providers/avatar/DidAvatarRenderer.js';
export { MockAvatarRenderer } from './providers/avatar/MockAvatarRenderer.js';

export * from './errors.js';
export { QualityValidator, DEFAULT_QUALITY_REQUIREMENTS } from './validation/quality.js';
