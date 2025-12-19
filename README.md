# AI Video Generation Engine (Core)

This repository originally shipped as a static marketing site. This ticket adds a **modular, provider-driven AI video generation engine** intended to be embedded by an API/backend.

> Note: Truly photorealistic, indistinguishable-from-human avatar video requires proprietary models and/or paid providers. This codebase provides the **core orchestration layer**, quality validation hooks, and provider adapters so you can plug in the best available avatar/voice stack (e.g. D-ID, Synthesia/HeyGen, custom ML).

## What’s included

- A core `VideoGenerationEngine` orchestrator
- Pluggable providers:
  - Speech synthesis: `AzureSpeechSynthesizer` (multilingual), `MockSpeechSynthesizer` (tests)
  - Avatar renderer: `DidAvatarRenderer` (talking-head provider), `MockAvatarRenderer` (tests)
- Error handling with explicit error types
- Quality validation (metadata-based; `ffprobe`-based probing supported when available)
- A minimal CLI for local/manual testing
- Unit tests (using Node’s built-in `node:test`)

## Requirements supported by architecture

- **60+ seconds**: the engine is duration-agnostic; providers are invoked with timeouts/polling suitable for long generations.
- **Multi-language TTS**: English (`en`), Spanish (`es`), Mandarin (`zh`), French (`fr`) are mapped to high-quality neural voices (Azure).
- **1080p @ 24–30fps**: enforced by quality requirements and passed to render providers.
- **MP4/WebM**: depends on provider output and/or a post-processing/muxing step. If `ffmpeg/ffprobe` are installed, you can add conversion/muxing easily; the engine already exposes the hooks.

## Install / Run tests

```bash
npm test
```

## CLI usage

The CLI is provider-agnostic. For real output you must set provider credentials.

```bash
node src/cli.js \
  --provider did \
  --sourceImageUrl "https://.../avatar.jpg" \
  --text "Hello world" \
  --language en \
  --format mp4 \
  --outDir .generated
```

### Environment variables

#### Azure TTS
- `AZURE_SPEECH_KEY`
- `AZURE_SPEECH_REGION`

#### D-ID avatar rendering
- `DID_API_KEY`

## Pipeline overview

1. **Input validation**
   - language support, output format, min quality requirements
2. **Speech synthesis (optional)**
   - provider creates an audio asset (or renderer can do integrated TTS)
3. **Avatar rendering**
   - provider produces a video (URL or file)
4. **Quality validation**
   - checks duration/resolution/fps (via metadata and optionally `ffprobe`)
5. **Return result**
   - output path/URL + metadata + validation report

## Extending for higher realism

To meet “indistinguishable from real footage”, you will typically combine:

- Best-in-class talking-head provider (or a custom diffusion/video model)
- High quality multilingual TTS (Azure/ElevenLabs) with SSML prosody controls
- A dedicated lip-sync model (e.g. Wav2Lip variants) for difficult phoneme alignment
- Face expression model (emotion/viseme conditioning)
- Post-processing (denoise, color grading, bitrate optimization)

This engine is structured so you can swap any part independently.
