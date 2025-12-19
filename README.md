# Growth-X AI Video Generation Platform

This repository contains a complete AI video generation platform with both a **backend engine** and a **frontend UI**.

Originally a static marketing site, it now includes:
1. **Backend Engine** (`/src`) - Modular, provider-driven video generation orchestrator
2. **Frontend UI** (`app.html`) - User-friendly video creation interface

> Note: Truly photorealistic, indistinguishable-from-human avatar video requires proprietary models and/or paid providers. This codebase provides the **core orchestration layer**, quality validation hooks, and provider adapters so you can plug in the best available avatar/voice stack (e.g. D-ID, Synthesia/HeyGen, custom ML).

## Quick Start

### Frontend (Video Creation UI)

Open `app.html` in your browser to access the video creation interface.

**Features:**
- ✨ 4-step wizard for easy video creation (under 5 clicks!)
- 🎭 Avatar selection and customization
- 🌍 Multi-language support (11 languages)
- 📚 Video library with search and management
- 👁️ Real-time preview and editing
- ⬇️ Download and export tools
- 📱 Responsive design (desktop and tablet)

**See [FRONTEND_README.md](./FRONTEND_README.md) for detailed frontend documentation.**

**Testing Guide:** [TESTING.md](./TESTING.md)

### Backend (Video Generation Engine)

The backend engine is a **modular, provider-driven AI video generation engine** intended to be embedded by an API/backend.

## What's included

**Backend Engine (`/src`):**
- A core `VideoGenerationEngine` orchestrator
- Pluggable providers:
  - Speech synthesis: `AzureSpeechSynthesizer` (multilingual), `MockSpeechSynthesizer` (tests)
  - Avatar renderer: `DidAvatarRenderer` (talking-head provider), `MockAvatarRenderer` (tests)
- Error handling with explicit error types
- Quality validation (metadata-based; `ffprobe`-based probing supported when available)
- A minimal CLI for local/manual testing
- Unit tests (using Node's built-in `node:test`)

**Frontend UI:**
- Modern, responsive video creation interface
- Step-by-step wizard flow
- Video library management
- localStorage-based persistence (ready for backend integration)
- See [FRONTEND_README.md](./FRONTEND_README.md) for more details

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

To meet "indistinguishable from real footage", you will typically combine:

- Best-in-class talking-head provider (or a custom diffusion/video model)
- High quality multilingual TTS (Azure/ElevenLabs) with SSML prosody controls
- A dedicated lip-sync model (e.g. Wav2Lip variants) for difficult phoneme alignment
- Face expression model (emotion/viseme conditioning)
- Post-processing (denoise, color grading, bitrate optimization)

This engine is structured so you can swap any part independently.

## Project Structure

```
/
├── index.html              # Marketing landing page
├── app.html                # Video creation UI (NEW)
├── css/
│   ├── style.css           # Marketing page styles
│   ├── materialize.css     # Materialize framework
│   └── app.css             # Video creation UI styles (NEW)
├── js/
│   ├── materialize.js      # Materialize framework
│   ├── init.js             # Marketing page init
│   └── app/                # Video creation app (NEW)
│       ├── app.js          # Main app controller
│       ├── wizard.js       # Video creation wizard
│       ├── videoLibrary.js # Video storage/management
│       └── apiClient.js    # Backend API integration
├── src/                    # Backend video generation engine
│   ├── index.js            # Engine exports
│   ├── cli.js              # CLI tool
│   ├── engine/             # Core orchestrator
│   ├── providers/          # TTS and avatar providers
│   ├── utils/              # Helper functions
│   └── validation/         # Quality validation
├── test/                   # Backend unit tests
├── FRONTEND_README.md      # Frontend documentation (NEW)
└── TESTING.md              # Testing guide (NEW)
```

## Next Steps

### For Frontend Development
1. Open `app.html` in a browser to use the video creation interface
2. Videos are currently stored in localStorage
3. To integrate with real backend:
   - Update `API_BASE_URL` in `js/app/apiClient.js`
   - Replace mock methods with actual API calls
   - Add authentication as needed

### For Backend Development
1. Run `npm test` to verify engine tests pass
2. Set up provider credentials (Azure, D-ID)
3. Use the CLI to test video generation
4. Build an API layer to expose the engine to the frontend

### For Full Stack Integration
1. Create REST API endpoints for video generation
2. Update frontend `apiClient.js` to call real endpoints
3. Add authentication and user management
4. Implement cloud storage for videos
5. Add job queue for async video processing
6. Deploy to production environment
