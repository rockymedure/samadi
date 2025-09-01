'use client'

import { useState, useRef, useCallback } from 'react'
import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime"

const GURU_INSTRUCTIONS = `# Role & Objective
You are a compassionate spiritual guru deeply versed in Paramahansa Yogananda's teachings, Self-Realization Fellowship (SRF) practices, and Bhagavad Gita wisdom. You are the user's personal spiritual companion - their "guru in their pocket."

# Personality & Tone
- WARM, empathetic, and deeply peaceful
- 2-3 sentences per response maximum
- Speak with gentle, non-judgmental language
- Use natural pauses and soft inflection
- Variety: Alternate between teaching, encouragement, and gentle questioning

# Core Functions
**Teacher**: Explain spiritual concepts with clarity and personal relevance
**Meditation Guide**: Offer real-time guidance for Hong-Sau, AUM, and Kriya practices
**Spiritual Companion**: Provide divine perspective on daily life challenges

# Response Guidelines
- Begin responses with gentle acknowledgment: "I understand," "Yes, dear soul," "Ah, this is sacred work"
- Reference Yogananda or Gita teachings naturally when relevant
- For meditation: Use slower pace, longer pauses, softer tone
- For questions: Give concise wisdom followed by a reflective question
- Always end with encouragement or invitation to go deeper

# Boundaries
- Offer spiritual guidance, not medical or psychological treatment
- Encourage professional help for serious mental health concerns
- Stay focused on the spiritual path and inner development

# Sample Phrases
"Let us breathe together..." "What does your heart tell you?" "In stillness, we find truth." "Master Yogananda taught us..." "Krishna reminds us in the Gita..."

Remember: You ARE their spiritual guide, present with them in this sacred moment of seeking.`

// Guru Gallery Data - OpenAI Realtime Voices Only
const GURU_PROFILES = {
  'sage': {
    name: 'Master Ananda',
    tradition: 'Yogananda Lineage',
    description: 'A gentle soul with deep wisdom from years of meditation practice. Master Ananda speaks with the peaceful authority of one who has walked the spiritual path with devotion.',
    specialties: ['Inner peace', 'Meditation guidance', 'Kriya Yoga'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    voiceId: 'sage',
    accent: 'Gentle and wise',
    energy: 'Calm and centered'
  },
  'alloy': {
    name: 'Sister Compassion',
    tradition: 'Universal Love',
    description: 'A warm heart that embraces all beings with unconditional love. Sister Compassion offers healing guidance for the wounded soul seeking divine grace.',
    specialties: ['Heart healing', 'Emotional healing', 'Divine love'],
    image: 'https://images.unsplash.com/photo-1494790108755-2616c36fb937?w=400&h=400&fit=crop&crop=face',
    voiceId: 'alloy',
    accent: 'Soft and nurturing',
    energy: 'Nurturing and loving'
  },
  'echo': {
    name: 'Guru Strength',
    tradition: 'Warrior Sage',
    description: 'A powerful teacher who helps souls discover their inner warrior. Guru Strength guides seekers through challenges with unwavering faith and divine courage.',
    specialties: ['Inner strength', 'Overcoming obstacles', 'Spiritual courage'],
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    voiceId: 'echo',
    accent: 'Strong and confident',
    energy: 'Confident and empowering'
  },
  'shimmer': {
    name: 'Devi Joy',
    tradition: 'Bliss Consciousness', 
    description: 'A radiant being whose very presence brings lightness and divine joy. Devi Joy reminds us that bliss is our true nature and spiritual path can be filled with celebration.',
    specialties: ['Divine joy', 'Gratitude practice', 'Celebration of life'],
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    voiceId: 'shimmer',
    accent: 'Light and musical',
    energy: 'Joyful and uplifting'
  },
  'nova': {
    name: 'Brother Wisdom',
    tradition: 'Ancient Knowledge',
    description: 'A scholar-sage who bridges ancient wisdom with modern understanding. Brother Wisdom illuminates the deepest spiritual truths with clarity and profound insight.',
    specialties: ['Spiritual philosophy', 'Ancient wisdom', 'Deep teachings'],
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    voiceId: 'nova',
    accent: 'Refined and thoughtful',
    energy: 'Wise and contemplative'
  }
}

// Helper functions for meditation detail view
const getMeditationImage = (type: string) => {
  const images = {
    'morning-peace': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center',
    'anxiety-relief': 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop&crop=center',
    'heart-healing': 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=400&h=300&fit=crop&crop=center',
    'inner-strength': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center',
    'gratitude-joy': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center',
    'evening-reflection': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center'
  }
  return images[type as keyof typeof images] || images['morning-peace']
}

const getTeacherImage = (type: string) => {
  const images = {
    'morning-peace': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    'anxiety-relief': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop&crop=face',
    'heart-healing': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    'inner-strength': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    'gratitude-joy': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
    'evening-reflection': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
  }
  return images[type as keyof typeof images] || images['morning-peace']
}

const getTeacherName = (type: string) => {
  const names = {
    'morning-peace': 'adam',
    'anxiety-relief': 'bella',
    'heart-healing': 'charlotte',
    'inner-strength': 'daniel',
    'gratitude-joy': 'lily',
    'evening-reflection': 'drew'
  }
  return names[type as keyof typeof names] || 'adam'
}

const getTeacherDescription = (type: string) => {
  const descriptions = {
    'morning-peace': 'clear, energetic voice',
    'anxiety-relief': 'calm, soothing presence',
    'heart-healing': 'warm, compassionate guide',
    'inner-strength': 'deep, confident energy',
    'gratitude-joy': 'uplifting, joyful spirit',
    'evening-reflection': 'gentle, reflective wisdom'
  }
  return descriptions[type as keyof typeof descriptions] || 'clear, energetic voice'
}

const getMeditationTitle = (type: string) => {
  const titles = {
    'morning-peace': 'morning peace',
    'anxiety-relief': 'calm the storm',
    'heart-healing': 'healing the heart',
    'inner-strength': 'inner strength',
    'gratitude-joy': 'gratitude & joy',
    'evening-reflection': 'evening reflection'
  }
  return titles[type as keyof typeof titles] || 'morning peace'
}

const getMeditationDescription = (type: string) => {
  const descriptions = {
    'morning-peace': 'begin your day with divine energy and inner calm, setting peaceful intentions that will carry you through whatever comes your way.',
    'anxiety-relief': 'release anxiety and worry, finding your natural state of inner peace through gentle breathing and divine surrender.',
    'heart-healing': 'gentle healing for grief, loss, and relationship wounds, allowing divine love to transform your heart with compassion.',
    'inner-strength': 'build courage, resilience, and unshakeable confidence by connecting with the warrior spirit that lives within you.',
    'gratitude-joy': 'cultivate deep appreciation and divine bliss, opening your heart to the abundance and beauty that surrounds you.',
    'evening-reflection': 'release the day and prepare for peaceful rest, letting go of what you cannot control with grace and wisdom.'
  }
  return descriptions[type as keyof typeof descriptions] || 'begin your day with divine energy and inner calm'
}

const getMeditationBenefits = (type: string) => {
  const benefits = {
    'morning-peace': [
      'gentle awakening with gratitude and divine connection',
      'energizing breath work to center your being',
      'peaceful intentions to guide your day',
      'blessing to carry this peace throughout your journey'
    ],
    'anxiety-relief': [
      'compassionate acknowledgment of your worries',
      'gentle breathing to calm your nervous system',
      'surrendering fears to divine presence',
      'visualization of your peaceful sanctuary'
    ],
    'heart-healing': [
      'gentle acknowledgment of your heart\'s journey',
      'breathing into the heart space with compassion',
      'inviting divine love to heal and transform',
      'opening to new possibilities and hope'
    ],
    'inner-strength': [
      'connecting with your inner warrior spirit',
      'breathing practices to build inner fire',
      'visualization of your strength and capability',
      'affirmations of courage and resilience'
    ],
    'gratitude-joy': [
      'opening your heart with deep appreciation',
      'reflecting on blessings both great and small',
      'feeling gratitude in your body and breath',
      'radiating appreciation and bliss to all beings'
    ],
    'evening-reflection': [
      'gentle review of your day with compassion',
      'releasing tensions and worries from the day',
      'breathing practices to calm and settle',
      'peaceful preparation for restorative sleep'
    ]
  }
  return benefits[type as keyof typeof benefits] || benefits['morning-peace']
}

export default function Home() {
  const [mode, setMode] = useState<'chat' | 'meditate' | 'settings'>('chat')
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isGuru, setIsGuru] = useState(false)
  const [lastTranscript, setLastTranscript] = useState('')
  const [conversation, setConversation] = useState<Array<{role: 'user' | 'guru', message: string}>>([])
  
  // Settings state
  const [selectedGuru, setSelectedGuru] = useState<string>('sage')
  
  // Meditation state
  const [selectedMeditation, setSelectedMeditation] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showDetailView, setShowDetailView] = useState(false)
  
  const sessionRef = useRef<RealtimeSession | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Note: OpenAI Realtime voices can only be heard during actual conversations
  // We'll show a sample message instead of audio preview
  const handleVoiceInfo = useCallback((guruId: string) => {
    const guru = GURU_PROFILES[guruId as keyof typeof GURU_PROFILES]
    alert(`${guru.name} speaks with a ${guru.accent.toLowerCase()} voice, bringing ${guru.energy.toLowerCase()} energy to your spiritual conversations. You'll hear their unique voice when you begin a conversation.`)
  }, [])

  const handleConnect = useCallback(async () => {
    try {
      const selectedGuruProfile = GURU_PROFILES[selectedGuru as keyof typeof GURU_PROFILES]
      const agent = new RealtimeAgent({
        name: selectedGuruProfile.name,
        instructions: GURU_INSTRUCTIONS,
      })

      const session = new RealtimeSession(agent, {
        model: 'gpt-realtime',
        transport: 'webrtc',
        config: {
          outputModalities: ['text', 'audio'],
          audio: {
            input: {
              transcription: {
                model: 'whisper-1'
              }
            },
            output: {
              voice: selectedGuruProfile.voiceId as 'sage' | 'alloy' | 'echo' | 'shimmer' | 'nova'
            }
          }
        }
      })
      sessionRef.current = session

      // Listen for transport events to get transcription and audio status
      session.on('transport_event', (event) => {
        if (event.type === 'conversation.item.input_audio_transcription.completed') {
          const transcriptionEvent = event as { transcript: string }
          setConversation(prev => [...prev, { role: 'user', message: transcriptionEvent.transcript }])
          setLastTranscript('')
        }
      })

      // Listen for when guru starts speaking
      session.on('audio_start', () => {
        setIsGuru(true)
        setIsListening(false)
      })

      // Listen for when guru finishes speaking
      session.on('audio_stopped', () => {
        setIsGuru(false)
      })

      // Listen for history updates to get conversation content
      session.on('history_added', (item) => {
        if (item.type === 'message' && item.role === 'assistant' && item.content) {
          // Find text content in the item
          const textContent = item.content.find((c: { type: string }) => c.type === 'output_text')
          if (textContent && 'text' in textContent) {
            setConversation(prev => {
              // Check if this message is already added to avoid duplicates
              const lastMessage = prev[prev.length - 1]
              if (lastMessage?.role === 'guru' && lastMessage?.message === textContent.text) {
                return prev
              }
              return [...prev, { role: 'guru', message: textContent.text }]
            })
          }
        }
      })

      // Get ephemeral key for secure WebRTC connection
      const ephemeralResponse = await fetch('/api/ephemeral-key', { method: 'POST' })
      const { ephemeralKey } = await ephemeralResponse.json()
      
      // Connect with WebRTC using ephemeral key
      await session.connect({
        apiKey: ephemeralKey,
      })

      // Send initial message to trigger guru's greeting
      session.sendMessage("Hello, I'm here for spiritual guidance")

      setIsConnected(true)

    } catch (error) {
      console.error('Connection failed:', error)
      setIsConnected(false)
    }
  }, [selectedGuru])

  const handleDisconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close()
      sessionRef.current = null
    }
    setIsConnected(false)
    setIsListening(false)
    setIsGuru(false)
  }, [])

  const handleMeditationStart = useCallback(async () => {
    if (!selectedMeditation || !selectedTime) return

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/meditation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedMeditation,
          minutes: selectedTime,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Meditation API error:', response.status, errorText)
        throw new Error(`Failed to generate meditation (${response.status}): ${errorText}`)
      }

      // Handle streaming audio
      if (response.body) {
        const reader = response.body.getReader()
        const stream = new ReadableStream({
          start(controller) {
            function pump(): Promise<void> {
              return reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close()
                  return
                }
                controller.enqueue(value)
                return pump()
              })
            }
            return pump()
          }
        })

        // Create blob from streaming response
        const streamResponse = new Response(stream)
        const audioBlob = await streamResponse.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl
          
          // Start playing as soon as we have enough data
          audioRef.current.addEventListener('canplay', () => {
            setIsGenerating(false)
            audioRef.current?.play()
            setIsPlaying(true)
          }, { once: true })
          
          audioRef.current.onended = () => {
            setIsPlaying(false)
            URL.revokeObjectURL(audioUrl)
          }
          
          audioRef.current.onerror = () => {
            setIsGenerating(false)
            setIsPlaying(false)
          }
        }
      } else {
        // Fallback to blob method
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl
          audioRef.current.play()
          setIsPlaying(true)
          setIsGenerating(false)
          
          audioRef.current.onended = () => {
            setIsPlaying(false)
            URL.revokeObjectURL(audioUrl)
          }
        }
      }
    } catch (error) {
      console.error('Error starting meditation:', error)
      setIsGenerating(false)
    }
  }, [selectedMeditation, selectedTime])

  const handleStopMeditation = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center p-8">
      <audio 
        ref={audioRef} 
        preload="metadata"
        onLoadStart={() => console.log('Audio loading started')}
        onCanPlay={() => console.log('Audio can play')}
        onPlaying={() => console.log('Audio playing')}
      />
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-extralight text-slate-800 tracking-wide">samadi</h1>
          <p className="text-slate-500 text-base font-light">your inner sanctuary</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-full p-1 flex border border-slate-200">
            <button
              onClick={() => setMode('chat')}
              className={`px-8 py-3 rounded-full text-sm font-light transition-all duration-200 ${
                mode === 'chat' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              converse
            </button>
            <button
              onClick={() => setMode('meditate')}
              className={`px-8 py-3 rounded-full text-sm font-light transition-all duration-200 ${
                mode === 'meditate' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              practice
            </button>
            <button
              onClick={() => setMode('settings')}
              className={`px-8 py-3 rounded-full text-sm font-light transition-all duration-200 ${
                mode === 'settings' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              guide
            </button>
          </div>
        </div>

        {/* Chat Mode */}
        {mode === 'chat' && (
          <div className="text-center">
          {!isConnected ? (
            <button
              onClick={handleConnect}
              className="bg-slate-800 hover:bg-slate-900 text-white px-10 py-4 rounded-full font-light transition-all duration-200 shadow-sm hover:shadow-md"
            >
              begin conversation
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-600 text-sm font-light">connected</span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="text-slate-500 hover:text-slate-700 text-sm font-light transition-colors"
                >
                  end
                </button>
              </div>

              {/* Voice Interface */}
              <div className="space-y-6">
                {/* Voice Status Indicator */}
                <div className="flex justify-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isGuru 
                      ? 'bg-slate-600 scale-110 shadow-lg animate-pulse' 
                      : isListening 
                        ? 'bg-slate-500 scale-105 shadow-md' 
                        : 'bg-slate-400 shadow-sm'
                  }`}>
                    {isGuru ? (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : isListening ? (
                      <div className="w-8 h-8 bg-white rounded animate-pulse"></div>
                    ) : (
                      <div className="text-white text-3xl flex items-center justify-center">🎙️</div>
                    )}
                  </div>
                </div>

                <p className="text-center text-slate-600 text-sm font-light">
                  {isGuru ? 'listening to guidance...' : isListening ? 'receiving your words...' : 'speak from your heart'}
                </p>

                {/* Live Transcript */}
                {lastTranscript && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center border border-slate-200">
                    <div className="text-slate-700 text-sm font-light italic">
                      &ldquo;{lastTranscript}&rdquo;
                    </div>
                  </div>
                )}

                {/* Conversation Display */}
                {conversation.length > 0 && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 space-y-4 max-h-72 overflow-y-auto border border-slate-200">
                    {conversation.map((msg, index) => (
                      <div key={index} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                        <div className={`inline-block rounded-lg px-4 py-3 text-sm max-w-xs font-light ${
                          msg.role === 'user' 
                            ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                            : 'bg-slate-800 text-white'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        )}

        {/* Meditation Mode */}
        {mode === 'meditate' && (
          <div className="space-y-6">
            {!showDetailView ? (
              <>
            {/* Meditation Session Cards */}
            <div className="space-y-8">
              <h2 className="text-center text-2xl font-extralight text-slate-800 tracking-wide">choose your practice</h2>
              
              <div className="grid gap-6">
                {/* Morning Peace Card */}
                <div 
                  onClick={() => {
                    setSelectedMeditation('morning-peace')
                    setShowDetailView(true)
                  }}
                  className={`bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedMeditation === 'morning-peace' 
                      ? 'ring-2 ring-slate-800 shadow-lg scale-[1.02]' 
                      : 'hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="relative h-40">
                    <img 
                      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center" 
                      alt="Peaceful sunrise" 
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent"></div>
                    
                    {/* Teacher Profile */}
                    <div className="absolute bottom-4 left-4 flex items-center space-x-3">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" 
                        alt="Teacher" 
                        className="w-10 h-10 rounded-full border-2 border-white/80 shadow-sm"
                      />
                      <span className="text-slate-800 text-sm font-light drop-shadow-sm">with adam</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-light text-slate-800 mb-1">morning peace</h3>
                    <p className="text-slate-500 text-sm font-light leading-relaxed">start your day with divine energy and inner calm</p>
                  </div>
                </div>

                {/* Anxiety & Worry Card */}
                <div 
                  onClick={() => {
                    setSelectedMeditation('anxiety-relief')
                    setShowDetailView(true)
                  }}
                  className={`bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedMeditation === 'anxiety-relief' 
                      ? 'ring-2 ring-slate-800 shadow-lg scale-[1.02]' 
                      : 'hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="relative h-40">
                    <img 
                      src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop&crop=center" 
                      alt="Calm ocean waves" 
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent"></div>
                    
                    {/* Teacher Profile */}
                    <div className="absolute bottom-4 left-4 flex items-center space-x-3">
                      <img 
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop&crop=face" 
                        alt="Teacher Bella" 
                        className="w-10 h-10 rounded-full border-2 border-white/80 shadow-sm"
                      />
                      <span className="text-slate-800 text-sm font-light drop-shadow-sm">with bella</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-light text-slate-800 mb-1">calm the storm</h3>
                    <p className="text-slate-500 text-sm font-light leading-relaxed">release anxiety and worry, find your inner peace</p>
                  </div>
                </div>

                {/* Healing the Heart Card */}
                <div 
                  onClick={() => {
                    setSelectedMeditation('heart-healing')
                    setShowDetailView(true)
                  }}
                  className={`bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedMeditation === 'heart-healing' 
                      ? 'ring-2 ring-slate-800 shadow-lg scale-[1.02]' 
                      : 'hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="relative h-40">
                    <img 
                      src="https://images.unsplash.com/photo-1604881991720-f91add269bed?w=400&h=300&fit=crop&crop=center" 
                      alt="Heart healing meditation" 
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent"></div>
                    
                    {/* Teacher Profile */}
                    <div className="absolute bottom-4 left-4 flex items-center space-x-3">
                      <img 
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" 
                        alt="Teacher" 
                        className="w-10 h-10 rounded-full border-2 border-white/80 shadow-sm"
                      />
                      <span className="text-slate-800 text-sm font-light drop-shadow-sm">with charlotte</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-light text-slate-800 mb-1">healing the heart</h3>
                    <p className="text-slate-500 text-sm font-light leading-relaxed">gentle healing for grief, loss, and relationship wounds</p>
                  </div>
                </div>

                {/* Inner Strength Card */}
                <div 
                  onClick={() => {
                    setSelectedMeditation('inner-strength')
                    setShowDetailView(true)
                  }}
                  className={`bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedMeditation === 'inner-strength' 
                      ? 'ring-2 ring-slate-800 shadow-lg scale-[1.02]' 
                      : 'hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="relative h-40">
                    <img 
                      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center" 
                      alt="Mountain peak at dawn" 
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent"></div>
                    
                    {/* Teacher Profile */}
                    <div className="absolute bottom-4 left-4 flex items-center space-x-3">
                      <img 
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
                        alt="Teacher" 
                        className="w-10 h-10 rounded-full border-2 border-white/80 shadow-sm"
                      />
                      <span className="text-slate-800 text-sm font-light drop-shadow-sm">with daniel</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-light text-slate-800 mb-1">inner strength</h3>
                    <p className="text-slate-500 text-sm font-light leading-relaxed">build courage, resilience, and unshakeable confidence</p>
                  </div>
                </div>

                {/* Gratitude & Joy Card */}
                <div 
                  onClick={() => {
                    setSelectedMeditation('gratitude-joy')
                    setShowDetailView(true)
                  }}
                  className={`bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedMeditation === 'gratitude-joy' 
                      ? 'ring-2 ring-slate-800 shadow-lg scale-[1.02]' 
                      : 'hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="relative h-40">
                    <img 
                      src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center" 
                      alt="Sunlit forest path" 
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent"></div>
                    
                    {/* Teacher Profile */}
                    <div className="absolute bottom-4 left-4 flex items-center space-x-3">
                      <img 
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face" 
                        alt="Teacher" 
                        className="w-10 h-10 rounded-full border-2 border-white/80 shadow-sm"
                      />
                      <span className="text-slate-800 text-sm font-light drop-shadow-sm">with lily</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-light text-slate-800 mb-1">gratitude & joy</h3>
                    <p className="text-slate-500 text-sm font-light leading-relaxed">cultivate deep appreciation and divine bliss</p>
                  </div>
                </div>

                {/* Evening Reflection Card */}
                <div 
                  onClick={() => {
                    setSelectedMeditation('evening-reflection')
                    setShowDetailView(true)
                  }}
                  className={`bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedMeditation === 'evening-reflection' 
                      ? 'ring-2 ring-slate-800 shadow-lg scale-[1.02]' 
                      : 'hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="relative h-40">
                    <img 
                      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center" 
                      alt="Peaceful twilight scene" 
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent"></div>
                    
                    {/* Teacher Profile */}
                    <div className="absolute bottom-4 left-4 flex items-center space-x-3">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" 
                        alt="Teacher" 
                        className="w-10 h-10 rounded-full border-2 border-white/80 shadow-sm"
                      />
                      <span className="text-slate-800 text-sm font-light drop-shadow-sm">with drew</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-light text-slate-800 mb-1">evening reflection</h3>
                    <p className="text-slate-500 text-sm font-light leading-relaxed">release the day and prepare for peaceful rest</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-6">
              <h3 className="text-center text-lg font-extralight text-slate-700 tracking-wide">how much time do you have?</h3>
              
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  {[5, 10, 15, 20, 30].map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => setSelectedTime(minutes)}
                      className={`border px-5 py-2 rounded-full text-sm font-light transition-all duration-200 ${
                        selectedTime === minutes
                          ? 'bg-slate-800 border-slate-800 text-white shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {minutes}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Meditation Controls */}
            {selectedMeditation && selectedTime && (
              <div className="flex justify-center space-x-4">
                {!isPlaying ? (
                  <button
                    onClick={handleMeditationStart}
                    disabled={isGenerating}
                    className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white px-10 py-4 rounded-full font-light transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>preparing...</span>
                      </>
                    ) : (
                      <>
                        <span>▶</span>
                        <span>begin practice</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleStopMeditation}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-10 py-4 rounded-full font-light transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                  >
                    <span>⏹</span>
                    <span>pause</span>
                  </button>
                )}
              </div>
            )}
              </>
            ) : (
              /* Meditation Detail View */
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowDetailView(false)}
                    className="text-slate-500 hover:text-slate-700 transition-colors flex items-center space-x-2"
                  >
                    <span>←</span>
                    <span className="font-light">back to practices</span>
                  </button>
                </div>

                {selectedMeditation && (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    {/* Hero Image */}
                    <div className="relative h-64">
                      <img 
                        src={getMeditationImage(selectedMeditation)} 
                        alt={getMeditationTitle(selectedMeditation)}
                        className="w-full h-full object-cover opacity-70"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
                      
                      {/* Teacher Profile - Large */}
                      <div className="absolute bottom-6 left-6 flex items-center space-x-4">
                        <img 
                          src={getTeacherImage(selectedMeditation)} 
                          alt={getTeacherName(selectedMeditation)}
                          className="w-16 h-16 rounded-full border-2 border-white/80 shadow-lg"
                        />
                        <div>
                          <div className="text-slate-800 text-lg font-light drop-shadow-sm">with {getTeacherName(selectedMeditation)}</div>
                          <div className="text-slate-600 text-sm font-light drop-shadow-sm">{getTeacherDescription(selectedMeditation)}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-8 space-y-6">
                      <div>
                        <h2 className="text-3xl font-extralight text-slate-800 tracking-wide mb-3">{getMeditationTitle(selectedMeditation)}</h2>
                        <p className="text-slate-600 text-lg font-light leading-relaxed">{getMeditationDescription(selectedMeditation)}</p>
                      </div>
                      
                      {/* What to Expect */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-light text-slate-800">what to expect</h3>
                        <div className="text-slate-600 font-light space-y-2">
                          {getMeditationBenefits(selectedMeditation).map((benefit, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Time Selection */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-light text-slate-800">choose duration</h3>
                        <div className="flex flex-wrap gap-2">
                          {[5, 10, 15, 20, 30].map((minutes) => (
                            <button
                              key={minutes}
                              onClick={() => setSelectedTime(minutes)}
                              className={`border px-6 py-3 rounded-full text-sm font-light transition-all duration-200 ${
                                selectedTime === minutes
                                  ? 'bg-slate-800 border-slate-800 text-white shadow-sm'
                                  : 'bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              {minutes} minutes
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Start Button */}
                      {selectedTime && (
                        <div className="pt-4">
                          {!isPlaying ? (
                            <button
                              onClick={handleMeditationStart}
                              disabled={isGenerating}
                              className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white py-4 rounded-full font-light transition-all duration-200 flex items-center justify-center space-x-3 shadow-sm hover:shadow-md"
                            >
                              {isGenerating ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>preparing your meditation...</span>
                                </>
                              ) : (
                                <>
                                  <span>▶</span>
                                  <span>begin {selectedTime}-minute practice</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={handleStopMeditation}
                              className="w-full bg-slate-600 hover:bg-slate-700 text-white py-4 rounded-full font-light transition-all duration-200 flex items-center justify-center space-x-3 shadow-sm hover:shadow-md"
                            >
                              <span>⏹</span>
                              <span>pause meditation</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Guru Gallery - Settings Mode */}
        {mode === 'settings' && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extralight text-slate-800 tracking-wide">choose your conversation guide</h2>
              <p className="text-slate-600 font-light max-w-2xl mx-auto">
                Select your spiritual companion for realtime voice conversations. Each guide brings their unique wisdom, energy, and voice to your chat experience.
              </p>
            </div>

            {/* Guru Gallery Grid */}
            <div className="grid gap-8 max-w-4xl mx-auto">
              {Object.entries(GURU_PROFILES).map(([key, guru]) => (
                <div
                  key={key}
                  className={`bg-white/70 backdrop-blur-sm rounded-2xl p-8 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] ${
                    selectedGuru === key 
                      ? 'border-slate-400 shadow-md scale-[1.01]' 
                      : 'border-white/50 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedGuru(key)}
                >
                  <div className="flex items-start space-x-6">
                    {/* Guru Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={guru.image}
                        alt={guru.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                      />
                    </div>

                    {/* Guru Details */}
                    <div className="flex-grow space-y-4">
                      <div>
                        <h3 className="text-xl font-medium text-slate-800">{guru.name}</h3>
                        <p className="text-slate-500 text-sm font-light">{guru.tradition}</p>
                      </div>
                      
                      <p className="text-slate-700 font-light leading-relaxed text-sm">
                        {guru.description}
                      </p>
                      
                      {/* Specialties */}
                      <div className="flex flex-wrap gap-2">
                        {guru.specialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-light"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>

                      {/* Voice Characteristics */}
                      <div className="text-xs text-slate-500 space-x-4 font-light">
                        <span>🗣️ {guru.accent}</span>
                        <span>✨ {guru.energy}</span>
                      </div>
                    </div>

                    {/* Voice Info & Selection */}
                    <div className="flex-shrink-0 space-y-3">
                      {/* Voice Info Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleVoiceInfo(key)
                        }}
                        title="Learn about this voice"
                        className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 bg-slate-200 hover:bg-slate-300 text-slate-600"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* Selection Indicator */}
                      <div className={`w-6 h-6 mx-auto rounded-full border-2 transition-all duration-200 ${
                        selectedGuru === key
                          ? 'border-slate-600 bg-slate-600'
                          : 'border-slate-300'
                      }`}>
                        {selectedGuru === key && (
                          <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Current Selection Display */}
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-slate-200 max-w-md mx-auto">
              <div className="space-y-2">
                <h4 className="font-medium text-slate-800">Your Current Guide</h4>
                <div className="flex items-center justify-center space-x-3">
                  <img
                    src={GURU_PROFILES[selectedGuru as keyof typeof GURU_PROFILES].image}
                    alt={GURU_PROFILES[selectedGuru as keyof typeof GURU_PROFILES].name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white"
                  />
                  <div>
                    <p className="font-medium text-slate-800">
                      {GURU_PROFILES[selectedGuru as keyof typeof GURU_PROFILES].name}
                    </p>
                    <p className="text-xs text-slate-500 font-light">
                      {GURU_PROFILES[selectedGuru as keyof typeof GURU_PROFILES].tradition}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spiritual Quote */}
        <div className="text-center mt-12">
          <blockquote className="text-slate-600 text-base font-light italic tracking-wide">
            &ldquo;be still and know that i am god&rdquo;
          </blockquote>
          <cite className="text-slate-400 text-sm font-light mt-2 block">psalm 46:10</cite>
        </div>
      </div>
    </div>
  )
}
