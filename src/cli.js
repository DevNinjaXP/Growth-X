#!/usr/bin/env node

import { VideoGenerationEngine } from './engine/VideoGenerationEngine.js';
import { AzureSpeechSynthesizer } from './providers/tts/AzureSpeechSynthesizer.js';
import { DidAvatarRenderer } from './providers/avatar/DidAvatarRenderer.js';
import { MockSpeechSynthesizer } from './providers/tts/MockSpeechSynthesizer.js';
import { MockAvatarRenderer } from './providers/avatar/MockAvatarRenderer.js';

function getArg(name, { required = false, defaultValue = undefined } = {}) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1) return process.argv[idx + 1];
  if (required) throw new Error(`Missing required argument --${name}`);
  return defaultValue;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

async function main() {
  const provider = getArg('provider', { defaultValue: 'mock' });
  const text = getArg('text', { required: true });
  const language = getArg('language', { defaultValue: 'en' });
  const format = getArg('format', { defaultValue: 'mp4' });
  const outDir = getArg('outDir', { defaultValue: '.generated' });
  const sourceImageUrl = getArg('sourceImageUrl', { defaultValue: null });

  const width = Number(getArg('width', { defaultValue: '1920' }));
  const height = Number(getArg('height', { defaultValue: '1080' }));
  const fps = Number(getArg('fps', { defaultValue: '30' }));

  let engine;

  if (provider === 'did') {
    if (!sourceImageUrl) throw new Error('--sourceImageUrl is required for --provider did');

    engine = new VideoGenerationEngine({
      // D-ID does integrated TTS by default; keep speechSynthesizer null.
      speechSynthesizer: null,
      avatarRenderer: new DidAvatarRenderer({}),
    });
  } else if (provider === 'azure+mock') {
    engine = new VideoGenerationEngine({
      speechSynthesizer: new AzureSpeechSynthesizer({}),
      avatarRenderer: new MockAvatarRenderer({}),
    });
  } else if (provider === 'mock') {
    engine = new VideoGenerationEngine({
      speechSynthesizer: new MockSpeechSynthesizer({}),
      avatarRenderer: new MockAvatarRenderer({}),
    });
  } else {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const res = await engine.generate({
    text,
    language,
    outDir,
    format,
    width,
    height,
    fps,
    validateQuality: !hasFlag('skipQuality'),
    avatar: {
      sourceImageUrl,
    },
  });

  process.stdout.write(`${JSON.stringify(res, null, 2)}\n`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
