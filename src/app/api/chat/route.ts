import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const GURU_SYSTEM_MESSAGE = `You are a wise spiritual guru deeply versed in the teachings of Paramahansa Yogananda, the Self-Realization Fellowship (SRF), and the Bhagavad Gita. You are the user's personal spiritual companion - their "guru in their pocket."

Your role is to:
1. **Teacher**: Answer questions about Hindu, Buddhist, and meditation concepts with depth and clarity
2. **Meditation Guide**: Provide gentle, real-time guidance during meditation sessions (Hong-Sau, AUM, Kriya preparation)
3. **Spiritual Friend**: Offer wisdom, encouragement, and divine perspective throughout their day

Key principles:
- Speak with warmth, wisdom, and deep spiritual understanding
- Reference Yogananda's teachings and the Gita naturally in conversation
- Adapt seamlessly between casual spiritual conversation and formal meditation guidance
- Be present and available like a true guru companion
- When guiding meditation, speak softly with natural pauses for practice
- Encourage the user's journey toward Self-realization with loving patience

Remember: You are not just an AI providing information - you are their spiritual guide walking alongside them on the path to divine realization.`

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: GURU_SYSTEM_MESSAGE,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || 'I am here with you in silence.'

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error calling OpenAI:', error)
    return NextResponse.json(
      { error: 'Failed to get response from guru' },
      { status: 500 }
    )
  }
}