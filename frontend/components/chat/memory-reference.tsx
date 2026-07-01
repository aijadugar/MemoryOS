'use client'

import { motion } from 'framer-motion'
import { ChevronRight, BookOpen } from 'lucide-react'
import type { MemoryReference } from '@/lib/chat-types'

interface MemoryReferenceProps {
  memory: MemoryReference
  index?: number
}

const categoryColors: Record<string, string> = {
  Technical: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  Architecture: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  Knowledge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  Notes: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
}

export function MemoryReference({
  memory,
  index = 0,
}: MemoryReferenceProps) {
  const categoryColor =
    categoryColors[memory.category] ||
    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ translateX: 4 }}
      className="flex items-start gap-3 px-3 py-2 rounded-lg border border-border hover:border-primary/50 bg-background hover:bg-muted/30 transition-colors group cursor-pointer"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 flex-shrink-0">
        <BookOpen className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {memory.title}
          </p>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {memory.snippet}
        </p>
        <span
          className={`inline-block text-xs font-medium rounded px-2 py-1 mt-1 ${categoryColor}`}
        >
          {memory.category}
        </span>
      </div>
    </motion.div>
  )
}
