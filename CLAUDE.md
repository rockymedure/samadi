# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Samadi - Spiritual Meditation Platform

A Next.js application that provides AI-powered guided meditations and spiritual conversations, built around Paramahansa Yogananda's teachings and Self-Realization Fellowship practices.

## Architecture

### Core Components

**Dual-Mode Interface** (`src/app/page.tsx`)
- **Meditate Mode**: Generates custom guided meditations with ElevenLabs voice synthesis
- **Chat Mode**: Real-time spiritual conversations using OpenAI Realtime API with voice capabilities
- Single React component managing both modes with state-driven UI switching

**API Routes** (`src/app/api/`)
- `/api/meditation` - GPT-5 + ElevenLabs pipeline for guided meditation generation
- `/api/chat` - Text-based spiritual conversations with GPT-4o
- `/api/generate-images` - OpenAI image generation for meditation visuals
- `/api/ephemeral-key` - OpenAI token management for client-side Realtime API

### Key Technical Decisions

**Meditation Generation Pipeline**:
1. GPT-5 Responses API with `reasoning: { effort: 'low' }` for fast generation
2. Token scaling: `minutes * 100` tokens for optimal speed/content balance
3. ElevenLabs V3 streaming for immediate audio playback
4. 6 specialized meditation types with unique prompts and voice mappings

**Performance Optimizations**:
- Meditation generation: ~20-30 seconds (down from 3+ minutes)
- Streaming audio prevents waiting for full generation
- Token limits tuned for 1,500-2,000 characters per 5-minute meditation

## Development Commands

```bash
# Development with Turbopack
npm run dev

# Production build with Turbopack  
npm run build

# Linting
npm run lint

# Start production server
npm start
```

## Environment Configuration

Required environment variables:
```bash
OPENAI_API_KEY=sk-proj-...     # OpenAI API with GPT-5 and Realtime access
ELEVENLABS_API_KEY=sk_...      # ElevenLabs API for voice synthesis
```

## Meditation System

### Voice Mapping
Each meditation type uses a specific ElevenLabs voice for authentic spiritual guidance:
- `morning-peace`: Adam (clear, energetic)
- `anxiety-relief`: Bella (calm, soothing)  
- `heart-healing`: Charlotte (warm, compassionate)
- `inner-strength`: Daniel (deep, confident)
- `gratitude-joy`: Lily (uplifting, joyful)
- `evening-reflection`: Drew (gentle, reflective)

### Prompt Engineering
Meditation prompts are structured functions that scale with duration and include:
- Specific spiritual guidance (Yogananda's teachings)
- Natural pacing cues (periods/commas, not SSML)
- Emotional tone appropriate to meditation type
- Progressive structure (opening → practice → closing)

### ElevenLabs V3 Settings
```typescript
voiceSettings: {
  stability: 0.5,        // Must be 0.0, 0.5, or 1.0 for V3
  similarityBoost: 0.8,
  style: 0.0,           // Reduced for V3 compatibility
  useSpeakerBoost: true,
  speed: 0.85           // Slower for meditative pace
}
```

## Chat System

### Spiritual Guidance Framework
The chat system embodies a spiritual guru persona with:
- Yogananda/Bhagavad Gita knowledge base
- 2-3 sentence responses for conversational flow
- Gentle, non-judgmental language
- Three core functions: Teacher, Meditation Guide, Spiritual Companion

### Realtime API Integration
**Architecture**:
- Uses `@openai/agents/realtime` with WebRTC transport
- `RealtimeSession` with `gpt-realtime` model for voice conversations
- Ephemeral key system via `/api/ephemeral-key` for secure client-side access

**Voice Configuration**:
```typescript
config: {
  outputModalities: ['text', 'audio'],
  audio: {
    input: { transcription: { model: 'whisper-1' } },
    output: { voice: 'sage' }  // Spiritual voice selection
  }
}
```

**Event Handling**:
- `transport_event`: Captures Whisper transcriptions
- `audio_start`/`audio_stopped`: Manages speaking states
- `history_added`: Processes assistant responses for conversation display

**UI States**:
- `isConnected`: WebRTC connection status
- `isListening`: User speaking detection
- `isGuru`: Assistant speaking indicator
- Real-time transcript preview and conversation history

## TypeScript Considerations

### Common Patterns
- Type assertions for ElevenLabs streams: `as unknown as AsyncIterable<Uint8Array>`
- Meditation type safety: `theme as keyof typeof MEDITATION_PROMPTS`
- Optional chaining for OpenAI responses: `response.data?.[0]?.url`

### Build Issues
- ElevenLabs streaming requires proper async iterator typing
- Image generation needs careful null checking
- Next.js prefers `next/image` over `<img>` tags (warnings only)

## Deployment

**Railway Configuration**:
- Environment variables: `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`
- Build command: `npm run build` (includes TypeScript checks)
- Turbopack enabled for faster builds

**Performance Targets**:
- 5-minute meditation: ~20-30 seconds generation
- Audio streaming starts immediately after text generation
- Total user wait time: <45 seconds for full meditation

## Spiritual Context

This is not just a meditation app but a digital spiritual companion. All changes should:
- Maintain authentic spiritual language and concepts
- Honor Yogananda's teachings and SRF practices
- Provide genuine spiritual value, not just technical functionality
- Balance spiritual depth with practical usability