import { api } from '@/lib/api'

export const voiceService = {
  chat: async (text?: string, conversationId?: string, audio?: Blob) => {
    if (audio) {
      const formData = new FormData()
      formData.append('file', audio, 'recording.webm')
      if (text) formData.append('text', text)
      if (conversationId) formData.append('conversation_id', conversationId)
      return (await api.post('/voice/chat', formData)).data
    }
    return (await api.post('/voice/chat', { text, conversation_id: conversationId })).data
  },
  textToSpeech: async (text: string) => (await api.post('/voice/text-to-speech', { text })).data,
  speechToText: async (file: Blob) => {
    const formData = new FormData()
    formData.append('file', file, 'recording.webm')
    return (await api.post('/voice/speech-to-text', formData)).data
  },
  voices: async () => (await api.get('/voice/voices')).data,
}
