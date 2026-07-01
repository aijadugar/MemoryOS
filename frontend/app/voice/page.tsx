'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Square, Copy, Volume2, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVoice } from '@/hooks/useVoice'

export default function VoicePage() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [history, setHistory] = useState<{ id: string; text: string; timestamp: string }[]>([])
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const { chat, speechToText, textToSpeech } = useVoice()

  const quickCommands = [
    'Create a reminder',
    'Search memories',
    'Add to calendar',
    'Send message',
    'Create task',
    'Save note',
  ]

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    chunksRef.current = []
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunksRef.current.push(event.data)
    }
    recorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop())
      const audio = new Blob(chunksRef.current, { type: 'audio/webm' })
      const response = await speechToText.mutateAsync(audio).catch((error: any) => {
        setTranscript(error?.message || 'Unable to transcribe audio.')
        return null
      })
      const text = response?.data?.transcript
      if (text) {
        setTranscript(text)
        setHistory((prev) => [{ id: Date.now().toString(), text, timestamp: 'just now' }, ...prev])
        const chatResponse = await chat.mutateAsync({ text, audio }).catch(() => null)
        if (chatResponse?.data?.audio_url) setAudioUrl(chatResponse.data.audio_url)
      }
    }
    recorderRef.current = recorder
    recorder.start()
    setIsRecording(true)
    setTranscript('Listening...')
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    recorderRef.current?.stop()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript)
  }

  const handleClearHistory = (id: string) => {
    setHistory(history.filter((h) => h.id !== id))
  }

  const handlePlay = async () => {
    const url = audioUrl || (await textToSpeech.mutateAsync(transcript)).data?.audio_url
    setAudioUrl(url)
    new Audio(url).play()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">Voice Assistant</h1>
          <p className="text-lg text-muted-foreground">
            Talk to MemoryOS. Your commands are processed instantly and securely.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card rounded-2xl p-8 border border-border mb-8 shadow-lg"
        >
          <div className="flex flex-col items-center">
            <motion.div
              animate={
                isRecording
                  ? {
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        '0 0 0 0 rgba(70, 130, 180, 0.7)',
                        '0 0 0 20px rgba(70, 130, 180, 0)',
                      ],
                    }
                  : {}
              }
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative mb-8"
            >
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-primary hover:bg-primary/90 text-white'
                }`}
              >
                {isRecording ? <Square size={48} /> : <Mic size={48} />}
              </button>
            </motion.div>

            <p className="text-sm text-muted-foreground mb-6">
              {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
            </p>

            <div className="w-full bg-muted rounded-lg p-6 mb-6 min-h-[100px] flex items-center justify-center">
              {transcript ? (
                <div className="w-full">
                  <p className="text-foreground text-lg leading-relaxed">{transcript}</p>
                  {!isRecording && transcript !== 'Listening...' && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={handleCopy}>
                        <Copy size={16} className="mr-2" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline" onClick={handlePlay}>
                        <Volume2 size={16} className="mr-2" />
                        Play
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">Your transcript will appear here</p>
              )}
            </div>

            <div className="w-full">
              <h3 className="text-sm font-semibold text-foreground mb-3">Quick Commands</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickCommands.map((command) => (
                  <button
                    key={command}
                    onClick={() => setTranscript(command)}
                    className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm text-foreground transition-colors text-center"
                  >
                    {command}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Commands</h2>
          <div className="space-y-3">
            {history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card border border-border rounded-lg p-4 flex items-start justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-foreground font-medium">{item.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
                </div>
                <button
                  onClick={() => handleClearHistory(item.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors ml-4"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
