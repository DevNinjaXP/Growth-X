import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  VideoGenerationEngine,
  MockSpeechSynthesizer,
  MockAvatarRenderer,
  QualityError,
} from '../src/index.js';

function words(count) {
  return Array.from({ length: count }, (_, i) => `w${i}`).join(' ');
}

test('generates a video with mocks and validates 1080p/30fps/60s by default', async () => {
  const engine = new VideoGenerationEngine({
    speechSynthesizer: new MockSpeechSynthesizer({ wordsPerMinute: 150 }),
    avatarRenderer: new MockAvatarRenderer({}),
  });

  const res = await engine.generate({
    text: words(150),
    language: 'en-US',
    outDir: '.generated-test',
    format: 'mp4',
  });

  assert.equal(res.language, 'en');
  assert.equal(res.format, 'mp4');
  assert.equal(res.metadata.width, 1920);
  assert.equal(res.metadata.height, 1080);
  assert.equal(res.metadata.fps, 30);
  assert.ok(res.metadata.durationSeconds >= 60);

  const stat = await fs.stat(res.outputPath);
  assert.ok(stat.isFile());
});

test('allows overriding duration requirements', async () => {
  const engine = new VideoGenerationEngine({
    speechSynthesizer: new MockSpeechSynthesizer({}),
    avatarRenderer: new MockAvatarRenderer({ fixedDurationSeconds: 5 }),
  });

  const res = await engine.generate({
    text: 'hello world',
    language: 'fr-FR',
    outDir: '.generated-test',
    format: 'webm',
    qualityRequirements: { minDurationSeconds: 1 },
  });

  assert.equal(res.language, 'fr');
  assert.equal(path.extname(res.outputPath), '.webm');
});

test('fails quality validation when requirements are not met', async () => {
  const engine = new VideoGenerationEngine({
    speechSynthesizer: new MockSpeechSynthesizer({}),
    avatarRenderer: new MockAvatarRenderer({ fixedDurationSeconds: 10 }),
  });

  await assert.rejects(
    () =>
      engine.generate({
        text: 'short text',
        language: 'es',
        outDir: '.generated-test',
        format: 'mp4',
        qualityRequirements: { minDurationSeconds: 120 },
      }),
    (err) => {
      assert.ok(err instanceof QualityError);
      return true;
    },
  );
});
