'use client'

import { Message } from '@/lib/chat-types'
import { MessageBubble } from './message-bubble'
import { TypingIndicator } from './typing-indicator'

interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
}

export function MessageList({ messages, isLoading = false }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLast={index === messages.length - 1}
        />
      ))}

      {isLoading && (
        <div className="flex gap-4 justify-start mb-6">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-primary">
            AI
          </div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-card border border-border">
            <TypingIndicator />
          </div>
        </div>
      )}
    </div>
  )
}
