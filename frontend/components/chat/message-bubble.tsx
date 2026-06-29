'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Copy,
  Check,
  Star,
  RotateCcw,
  Share2,
  ChevronDown,
} from 'lucide-react'
import { Message } from '@/lib/chat-types'
import { CitationCard } from './citation-card'
import { MemoryReference } from './memory-reference'

interface MessageBubbleProps {
  message: Message
  isLast?: boolean
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar (only for assistant) */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-primary">
          AI
        </div>
      )}

      {/* Message Content */}
      <div className={`flex-1 max-w-2xl ${isUser ? 'flex justify-end' : ''}`}>
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-foreground border border-border'
          }`}
        >
          {/* Message Text */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* File References */}
          {message.files && message.files.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
              {message.files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-2 py-1 rounded bg-background/50 text-xs"
                >
                  <span className="text-base">📎</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.citations.map((citation, idx) => (
              <CitationCard
                key={citation.id}
                citation={citation}
                index={idx}
              />
            ))}
          </div>
        )}

        {/* Memory References */}
        {message.memoryReferences && message.memoryReferences.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.memoryReferences.map((memory, idx) => (
              <MemoryReference
                key={memory.id}
                memory={memory}
                index={idx}
              />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {!isUser && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className={`p-2 rounded-md transition-colors ${
                  isCopied
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
                title="Copy message"
              >
                {isCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-md transition-colors ${
                  isBookmarked
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
                title="Bookmark message"
              >
                <Star
                  className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`}
                />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                title="Regenerate response"
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                title="Share message"
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.button>

              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute right-0 top-10 bg-card border border-border rounded-lg shadow-lg z-10"
                >
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors">
                    Edit
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors border-t border-border">
                    Translate
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors border-t border-border text-destructive">
                    Delete
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
