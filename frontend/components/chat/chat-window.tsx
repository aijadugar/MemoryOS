'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Menu, X } from 'lucide-react'
import { Conversation } from '@/lib/chat-types'
import { MessageList } from './message-list'
import { ChatInput } from './chat-input'
import { SuggestedPrompts } from './suggested-prompts'

interface ChatWindowProps {
  conversation?: Conversation
  onSendMessage: (content: string, files?: File[]) => void
  onSidebarToggle: () => void
  isSidebarOpen: boolean
}

export function ChatWindow({
  conversation,
  onSendMessage,
  onSidebarToggle,
  isSidebarOpen,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true)

  useEffect(() => {
    if (isScrolledToBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [conversation?.messages, isScrolledToBottom])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const isAtBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < 50
    setIsScrolledToBottom(isAtBottom)
  }

  const handleScrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  const messages = conversation?.messages || []
  const hasMessages = messages.length > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex-1 flex flex-col h-full bg-background"
    >
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 hover:bg-muted rounded-md transition-colors"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <h2 className="text-lg font-semibold text-foreground">
            {conversation?.title || 'New Chat'}
          </h2>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 lg:px-6 py-6"
      >
        {!hasMessages ? (
          <EmptyChatState />
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      {/* Scroll to bottom button */}
      {!isScrolledToBottom && hasMessages && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          onClick={handleScrollToBottom}
          className="mx-auto mb-4 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
        >
          New messages
        </motion.button>
      )}

      {/* Suggested Prompts or Input */}
      <div className="border-t border-border px-4 lg:px-6 py-6">
        {!hasMessages && <SuggestedPrompts onSelectPrompt={onSendMessage} />}
        <ChatInput onSendMessage={onSendMessage} />
      </div>
    </motion.div>
  )
}

function EmptyChatState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col items-center justify-center gap-4"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <MessageCircle className="w-8 h-8 text-primary" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Start a new conversation
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Ask anything or try one of the suggested prompts below to get started
        </p>
      </div>
    </motion.div>
  )
}
