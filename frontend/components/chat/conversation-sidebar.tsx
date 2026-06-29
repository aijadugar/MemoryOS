'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Trash2, Star } from 'lucide-react'
import { Conversation } from '@/lib/chat-types'
import { Button } from '@/components/ui/button'

interface ConversationSidebarProps {
  conversations: Conversation[]
  activeConversationId?: string
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  onDeleteConversation: (id: string) => void
  onToggleBookmark: (id: string) => void
  isOpen?: boolean
  onClose?: () => void
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onToggleBookmark,
  isOpen = true,
  onClose,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.messages.some((msg) =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  const bookmarkedConversations = filteredConversations.filter(
    (conv) => conv.isBookmarked
  )
  const otherConversations = filteredConversations.filter(
    (conv) => !conv.isBookmarked
  )

  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />

          {/* Sidebar */}
          <motion.aside
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="fixed lg:relative left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col z-40 lg:z-0"
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <Button
                onClick={onNewChat}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-md bg-muted text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {bookmarkedConversations.length > 0 && (
                  <div key="bookmarked">
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Bookmarked
                    </div>
                    {bookmarkedConversations.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        isActive={activeConversationId === conv.id}
                        isHovered={hoveredId === conv.id}
                        onSelect={onSelectConversation}
                        onDelete={onDeleteConversation}
                        onToggleBookmark={onToggleBookmark}
                        onHover={setHoveredId}
                      />
                    ))}
                  </div>
                )}

                {otherConversations.length > 0 && (
                  <div key="other">
                    {bookmarkedConversations.length > 0 && (
                      <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Recent
                      </div>
                    )}
                    {otherConversations.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        isActive={activeConversationId === conv.id}
                        isHovered={hoveredId === conv.id}
                        onSelect={onSelectConversation}
                        onDelete={onDeleteConversation}
                        onToggleBookmark={onToggleBookmark}
                        onHover={setHoveredId}
                      />
                    ))}
                  </div>
                )}

                {filteredConversations.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No conversations found
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  isHovered: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onToggleBookmark: (id: string) => void
  onHover: (id: string | null) => void
}

function ConversationItem({
  conversation,
  isActive,
  isHovered,
  onSelect,
  onDelete,
  onToggleBookmark,
  onHover,
}: ConversationItemProps) {
  const messageCount = conversation.messages.length

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      onClick={() => onSelect(conversation.id)}
      onMouseEnter={() => onHover(conversation.id)}
      onMouseLeave={() => onHover(null)}
      className={`mx-2 my-1 px-3 py-2 rounded-md cursor-pointer transition-colors ${
        isActive
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-muted text-foreground'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{conversation.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {messageCount} {messageCount === 1 ? 'message' : 'messages'}
          </p>
        </div>

        {(isHovered || isActive) && (
          <div className="flex items-center gap-1 shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation()
                onToggleBookmark(conversation.id)
              }}
              className="p-1 hover:bg-background rounded-md transition-colors"
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  conversation.isBookmarked
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation()
                onDelete(conversation.id)
              }}
              className="p-1 hover:bg-destructive/10 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
