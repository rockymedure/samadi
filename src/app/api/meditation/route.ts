import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
})

// Meditation prompts for different topical themes
const MEDITATION_PROMPTS = {
  'morning-peace': (minutes: number) => `Create a focused ${minutes}-minute morning meditation script. Structure:
1. Welcome & centering (30 seconds)
2. Gratitude practice (2-3 minutes) 
3. Setting intentions (remaining time)
4. Closing blessing (30 seconds)

Keep it concise and direct. Use warm, peaceful language with natural pauses marked as [pause]. Example: "Good morning, dear soul... [pause] Let us begin this sacred day together..."`,

  'anxiety-relief': (minutes: number) => `Create a ${minutes}-minute meditation for calming anxiety and worry. Include:
- Acknowledging the worry with compassion (2-3 minutes)
- Gentle breathing to slow the nervous system
- Surrendering fears to the divine presence
- Guided visualization of peaceful sanctuary
- Affirmations of safety and divine protection
Use soothing language: "It is natural to feel worried, my child..." "But you are safe in God's loving presence..." "Let us breathe together and find your peace..."`,

  'heart-healing': (minutes: number) => `Create a ${minutes}-minute meditation for healing grief, loss, and relationship wounds. Include:
- Gentle acknowledgment of the heart's pain (3-4 minutes)
- Breathing into the heart space with compassion
- Inviting divine love to heal and transform
- Releasing what no longer serves with love
- Opening to new possibilities and hope
Use healing language: "Your heart has been through much, dear one..." "God's love is healing you even now..." "It is safe to feel and to heal..."`,

  'inner-strength': (minutes: number) => `Create a ${minutes}-minute meditation for building courage, resilience, and confidence. Include:
- Connecting with the warrior spirit within (2-3 minutes)
- Breathing practices to build inner fire and power
- Visualizing yourself as strong and capable
- Drawing strength from divine source
- Affirmations of courage and resilience
Use empowering language: "You have such strength within you..." "God has given you everything you need..." "You are more powerful than you know, my child..."`,

  'gratitude-joy': (minutes: number) => `Create a ${minutes}-minute meditation for cultivating gratitude and divine joy. Include:
- Opening the heart with appreciation (2-3 minutes)
- Reflecting on blessings both great and small
- Feeling gratitude in the body and breath
- Connecting with the joy that is your true nature
- Radiating appreciation and bliss to all beings
Use joyful language: "So much to be grateful for, isn't it?" "Joy is your birthright, dear soul..." "Let your heart overflow with appreciation..."`,

  'evening-reflection': (minutes: number) => `Create a ${minutes}-minute evening meditation for releasing the day and preparing for rest. Include:
- Gentle review of the day with compassion (3-4 minutes)
- Releasing any tensions or worries from the day
- Breathing practices to calm and settle
- Gratitude for lessons learned and growth
- Peaceful preparation for restorative sleep
Use calming evening language: "The day is complete, dear one..." "Release what you cannot control..." "Rest now in divine peace and protection..."`
}

// ElevenLabs voice selection based on meditation type
const VOICE_MAP = {
  'morning-peace': 'pNInz6obpgDQGcFmaJgB',        // Adam - Clear, energetic
  'anxiety-relief': 'EXAVITQu4vr4xnSDxMaL',       // Bella - Calm, soothing  
  'heart-healing': 'XB0fDUnXU5powFXDhCwa',        // Charlotte - Warm, compassionate
  'inner-strength': 'onwK4e9ZLuTAKqWW03F9',       // Daniel - Deep, confident
  'gratitude-joy': 'pFZP5JQG7iQjIQuC4Bku',       // Lily - Uplifting, joyful
  'evening-reflection': '29vD33N1CtxCmqQRPOHJ'    // Drew - Gentle, reflective
}

export async function POST(request: NextRequest) {
  try {
    const { type, minutes } = await request.json()

    if (!type || !minutes) {
      return NextResponse.json(
        { error: 'Missing type or minutes parameter' },
        { status: 400 }
      )
    }

    if (!MEDITATION_PROMPTS[type as keyof typeof MEDITATION_PROMPTS]) {
      return NextResponse.json(
        { error: 'Invalid meditation type' },
        { status: 400 }
      )
    }

    // Generate meditation script using Responses API with GPT-5
    const prompt = MEDITATION_PROMPTS[type as keyof typeof MEDITATION_PROMPTS](minutes)
    
    const response = await openai.responses.create({
      model: 'gpt-5',
      reasoning: { effort: 'low' }, // Fast generation
      instructions: 'You are a compassionate spiritual guru deeply versed in Paramahansa Yogananda\'s teachings. Create guided meditations with natural speech flow and breathing spaces. Use warm, peaceful language with a gentle Indian accent in the writing style. Write with natural pacing using periods and commas for breathing moments.',
      input: prompt,
      max_output_tokens: minutes * 200, // Scale tokens with meditation length (200 tokens per minute for fuller content)
    })

    console.log('GPT-5 response structure:', {
      id: response.id,
      model: response.model,
      output_text_length: response.output_text?.length || 0,
      output_array_length: response.output?.length || 0,
      status: response.status
    })

    const script = response.output_text
    if (!script) {
      console.error('No output_text found. Full response:', JSON.stringify(response, null, 2))
      throw new Error('Failed to generate meditation script - no content returned')
    }

    // Convert to speech using ElevenLabs with streaming
    const voiceId = VOICE_MAP[type as keyof typeof VOICE_MAP] || 'pNInz6obpgDQGcFmaJgB'
    
    const audioStream = await elevenlabs.textToSpeech.stream(voiceId, {
      text: script,
      modelId: 'eleven_v3', // Using latest V3 model for better expressiveness
      outputFormat: 'mp3_44100_128',
      voiceSettings: {
        stability: 0.5, // Natural setting for V3 (must be 0.0, 0.5, or 1.0)
        similarityBoost: 0.8,
        style: 0.0, // Reduced style for V3 compatibility
        useSpeakerBoost: true,
        speed: 0.85, // Slightly slower for meditative pace
      },
    })

    // Create a readable stream that pipes ElevenLabs chunks directly to client
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of audioStream as unknown as AsyncIterable<Uint8Array>) {
            controller.enqueue(chunk)
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Error creating meditation:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create meditation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}