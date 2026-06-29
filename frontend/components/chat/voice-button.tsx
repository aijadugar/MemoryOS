'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Square } from 'lucide-react'

interface VoiceButtonProps {
  onTranscription?: (text: string) => void
}

export function VoiceButton({ onTranscription }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false)

  const handleVoiceClick = () => {
    if (isRecording) {
      setIsRecording(false)
      // In a real implementation, stop recording and send audio
      if (onTranscription) {
        onTranscription('(Voice input would appear here)')
      }
    } else {
      setIsRecording(true)
      // In a real implementation, start recording
    }
  }

  const recordingVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
      },
    },
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleVoiceClick}
      animate={isRecording ? 'animate' : 'initial'}
      variants={recordingVariants}
      className={`p-2 rounded-md transition-colors ${
        isRecording
          ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      }`}
      title={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording ? (
        <Square className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </motion.button>
  )
}
