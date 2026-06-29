'use client'

import { motion } from 'framer-motion'
import { X, Link as LinkIcon } from 'lucide-react'
import { Citation } from '@/lib/chat-types'

interface SourcesPanelProps {
  sources: Citation[]
  isOpen: boolean
  onClose: () => void
}

export function SourcesPanel({ sources, isOpen, onClose }: SourcesPanelProps) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border shadow-lg z-50 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Sources</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto">
        {sources.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No sources found
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {sources.map((source, index) => (
              <motion.a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 bg-background hover:bg-muted/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted flex-shrink-0">
                  <span className="text-base">{source.favicon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {source.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {source.domain}
                  </p>
                  {source.snippet && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {source.snippet}
                    </p>
                  )}
                </div>
                <LinkIcon className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
