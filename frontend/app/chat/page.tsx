'use client'

import { useState, useCallback } from 'react'
import { Conversation } from '@/lib/chat-types'
import { mockConversations } from '@/lib/chat-mock-data'
import { ConversationSidebar } from '@/components/chat/conversation-sidebar'
import { ChatWindow } from '@/components/chat/chat-window'

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(
    mockConversations
  )
  const [activeConversationId, setActiveConversationId] = useState<string>(
    mockConversations[0]?.id || ''
  )
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  )

  const handleNewChat = useCallback(() => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isBookmarked: false,
    }
    setConversations((prev) => [newConversation, ...prev])
    setActiveConversationId(newConversation.id)
    setSidebarOpen(false)
  }, [])

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id)
    setSidebarOpen(false)
  }, [])

  const handleDeleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id)
      setActiveConversationId(remaining[0]?.id || '')
    }
  }, [activeConversationId, conversations])

  const handleToggleBookmark = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isBookmarked: !c.isBookmarked } : c
      )
    )
  }, [])

  const handleSendMessage = useCallback(
    (content: string, files?: File[]) => {
      if (!activeConversation) return

      const newMessage = {
        id: Date.now().toString(),
        role: 'user' as const,
        content,
        timestamp: new Date(),
        files: files?.map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
        })),
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                messages: [...c.messages, newMessage],
                updatedAt: new Date(),
              }
            : c
        )
      )

      // Update conversation title if it's "New Chat"
      if (activeConversation.title === 'New Chat') {
        const titlePreview = content.substring(0, 30)
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId
              ? { ...c, title: titlePreview }
              : c
          )
        )
      }

      // Simulate assistant response after a delay
      setTimeout(() => {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content:
            'I understand. This is a demonstration of the chat interface. In a real implementation, this would be connected to an AI backend service.',
          timestamp: new Date(),
        }

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId
              ? {
                  ...c,
                  messages: [...c.messages, assistantMessage],
                  updatedAt: new Date(),
                }
              : c
          )
        )
      }, 1500)
    },
    [activeConversation, activeConversationId]
  )

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onToggleBookmark={handleToggleBookmark}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <ChatWindow
        conversation={activeConversation}
        onSendMessage={handleSendMessage}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />
    </div>
  )
}
