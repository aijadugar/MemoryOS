'use client'

import { useState, useCallback, useEffect } from 'react'
import { Conversation } from '@/lib/chat-types'
import { ConversationSidebar } from '@/components/chat/conversation-sidebar'
import { ChatWindow } from '@/components/chat/chat-window'
import { useChat } from '@/hooks/useChat'

export default function ChatPage() {
  const { history, sendMessage, title } = useChat()
  const [localConversations, setLocalConversations] = useState<Conversation[]>([])
  const conversations = localConversations.length ? localConversations : history.data || []
  const [activeConversationId, setActiveConversationId] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!activeConversationId && conversations[0]?.id) {
      setActiveConversationId(conversations[0].id)
    }
  }, [activeConversationId, conversations])

  const activeConversation = conversations.find((c) => c.id === activeConversationId)

  const handleNewChat = useCallback(() => {
    const newConversation: Conversation = {
      id: `local-${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isBookmarked: false,
    }
    setLocalConversations((prev) => [newConversation, ...prev])
    setActiveConversationId(newConversation.id)
    setSidebarOpen(false)
  }, [])

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id)
    setSidebarOpen(false)
  }, [])

  const handleDeleteConversation = useCallback((id: string) => {
    setLocalConversations((prev) => prev.filter((c) => c.id !== id))
    if (activeConversationId === id) {
      setActiveConversationId(conversations.filter((c) => c.id !== id)[0]?.id || '')
    }
  }, [activeConversationId, conversations])

  const handleToggleBookmark = useCallback((id: string) => {
    setLocalConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isBookmarked: !c.isBookmarked } : c))
    )
  }, [])

  const handleSendMessage = useCallback(
    (content: string, files?: File[]) => {
      const conversation =
        activeConversation ||
        ({
          id: `local-${Date.now()}`,
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isBookmarked: false,
        } satisfies Conversation)

      if (!activeConversation) {
        setLocalConversations((prev) => [conversation, ...prev])
        setActiveConversationId(conversation.id)
      }

      const userMessage = {
        id: `${Date.now()}-user`,
        role: 'user' as const,
        content,
        timestamp: new Date(),
        files: files?.map((file) => ({ name: file.name, type: file.type, size: file.size })),
      }

      setLocalConversations((prev) =>
        prev.map((c) =>
          c.id === conversation.id
            ? { ...c, messages: [...c.messages, userMessage], updatedAt: new Date() }
            : c
        )
      )

      sendMessage.mutate(
        { message: content, conversationId: conversation.id.startsWith('local-') ? undefined : conversation.id },
        {
          onSuccess: async (response) => {
            const backendConversationId = response.conversation_id || conversation.id
            const assistantMessage = {
              id: `${Date.now()}-assistant`,
              role: 'assistant' as const,
              content: response.message,
              timestamp: new Date(response.timestamp),
            }

            setLocalConversations((prev) =>
              prev.map((c) =>
                c.id === conversation.id
                  ? {
                      ...c,
                      id: backendConversationId,
                      messages: [...c.messages, assistantMessage],
                      updatedAt: new Date(),
                    }
                  : c
              )
            )
            setActiveConversationId(backendConversationId)

            if (conversation.title === 'New Chat') {
              const titleResponse = await title.mutateAsync(content).catch(() => null)
              if (titleResponse?.title) {
                setLocalConversations((prev) =>
                  prev.map((c) => (c.id === backendConversationId ? { ...c, title: titleResponse.title } : c))
                )
              }
            }
          },
          onError: (error: any) => {
            const assistantMessage = {
              id: `${Date.now()}-error`,
              role: 'assistant' as const,
              content: error?.message || 'Unable to send message right now.',
              timestamp: new Date(),
              error: error?.message,
            }
            setLocalConversations((prev) =>
              prev.map((c) => (c.id === conversation.id ? { ...c, messages: [...c.messages, assistantMessage] } : c))
            )
          },
        }
      )
    },
    [activeConversation, sendMessage, title]
  )

  return (
    <div className="flex h-full overflow-hidden bg-background">
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

      <ChatWindow
        conversation={activeConversation}
        onSendMessage={handleSendMessage}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />
    </div>
  )
}
