import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Image prompts for each meditation theme
const IMAGE_PROMPTS = {
  'morning-peace': 'Peaceful sunrise meditation scene with soft golden light, gentle mountain silhouettes, calm lake reflection, ethereal mist, spiritual and serene atmosphere, warm amber and orange tones, perfect for morning meditation',
  
  'anxiety-relief': 'Calming ocean waves scene with soft blue tones, peaceful water surface, gentle foam, tranquil sky, soothing and therapeutic atmosphere, blue and teal color palette, perfect for anxiety relief meditation',
  
  'heart-healing': 'Gentle healing light surrounding an opening lotus flower, soft pink and rose tones, warm compassionate energy, sacred healing space, divine love radiating, perfect for heart healing meditation',
  
  'inner-strength': 'Majestic mountain peak with powerful lightning in purple and indigo sky, strong spiritual energy, divine power radiating, courage and resilience symbolized, perfect for inner strength meditation',
  
  'gratitude-joy': 'Abundant garden scene with blooming flowers, vibrant green foliage, golden sunlight filtering through leaves, joyful and grateful energy, emerald and lime tones, perfect for gratitude meditation',
  
  'evening-reflection': 'Peaceful moonlit scene with gentle silver light, calm night sky, tranquil reflection, quiet contemplative atmosphere, soft gray and blue tones, perfect for evening meditation'
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { theme } = body
    
    if (!theme || !IMAGE_PROMPTS[theme]) {
      return NextResponse.json(
        { error: 'Invalid or missing theme parameter' },
        { status: 400 }
      )
    }

    console.log(`Generating image for ${theme}...`)
    
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: IMAGE_PROMPTS[theme],
      n: 1,
      size: '1024x1024',
    })
    
    const imageUrl = response.data[0]?.url
    if (!imageUrl) {
      throw new Error('No image URL returned from API')
    }

    return NextResponse.json({
      success: true,
      theme,
      imageUrl,
      message: `Generated image for ${theme}`
    })

  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper endpoint to get all available themes
export async function GET() {
  return NextResponse.json({
    themes: Object.keys(IMAGE_PROMPTS),
    prompts: IMAGE_PROMPTS
  })
}