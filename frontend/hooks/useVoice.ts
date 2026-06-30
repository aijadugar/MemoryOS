import { useMutation, useQuery } from '@tanstack/react-query'
import { voiceService } from '@/services/voice'

export function useVoice() {
  const voices = useQuery({ queryKey: ['voice', 'voices'], queryFn: voiceService.voices })
  const chat = useMutation({
    mutationFn: ({ text, conversationId, audio }: { text?: string; conversationId?: string; audio?: Blob }) =>
      voiceService.chat(text, conversationId, audio),
  })
  const textToSpeech = useMutation({ mutationFn: (text: string) => voiceService.textToSpeech(text) })
  const speechToText = useMutation({ mutationFn: (file: Blob) => voiceService.speechToText(file) })

  return { voices, chat, textToSpeech, speechToText }
}
