import { api } from '@/lib/api'

export const chatService = {
  send: async (message: string, conversationId?: string) =>
    (await api.post('/chat', { message, conversation_id: conversationId })).data,
  history: async () => (await api.get('/chat/history')).data,
  deleteHistory: async () => (await api.delete('/chat/history')).data,
  title: async (message: string) => (await api.post('/chat/title', { message })).data,
}
