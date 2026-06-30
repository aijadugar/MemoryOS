import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatService } from '@/services/chat'
import { Conversation, Message } from '@/lib/chat-types'

function toConversationMap(messages: any[] = []): Conversation[] {
  const grouped = new Map<string, Message[]>()
  messages.forEach((item) => {
    const id = item.conversation_id || 'default'
    const list = grouped.get(id) || []
    list.push({
      id: item.id,
      role: item.role,
      content: item.message,
      timestamp: new Date(item.timestamp),
    })
    grouped.set(id, list)
  })

  return Array.from(grouped.entries()).map(([id, list]) => ({
    id,
    title: list.find((message) => message.role === 'user')?.content.slice(0, 30) || 'Conversation',
    messages: list,
    createdAt: list[0]?.timestamp || new Date(),
    updatedAt: list[list.length - 1]?.timestamp || new Date(),
    isBookmarked: false,
  }))
}

export function useChat() {
  const queryClient = useQueryClient()
  const history = useQuery({
    queryKey: ['chat', 'history'],
    queryFn: async () => toConversationMap((await chatService.history()).messages),
  })

  const sendMessage = useMutation({
    mutationFn: ({ message, conversationId }: { message: string; conversationId?: string }) =>
      chatService.send(message, conversationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat', 'history'] }),
  })

  const title = useMutation({ mutationFn: (message: string) => chatService.title(message) })

  return { history, sendMessage, title }
}
