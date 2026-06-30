'use client'

import { motion } from 'framer-motion'
import { Search, Brain } from 'lucide-react'
import { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'

type MemoryCard = {
  id: string
  title: string
  category: string
  description: string
  tags: string[]
  timestamp: Date
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { recent } = useDashboard()
  const memories: MemoryCard[] = (recent.data?.memories || []).map((memory: any) => ({
    id: memory.id,
    title: memory.metadata?.title || memory.content?.slice(0, 48) || 'Memory',
    category: memory.metadata?.category || memory.metadata?.type || 'Memory',
    description: memory.content || memory.summary || '',
    tags: memory.metadata?.tags || [],
    timestamp: new Date(memory.created_at),
  }))

  const results = searchQuery.trim()
    ? memories.filter(
        (memory: MemoryCard) =>
          memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          memory.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          memory.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : []

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.section variants={itemVariants}>
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
            Search Memories
          </h1>
          <p className="text-muted-foreground">
            Find anything in your memory database instantly
          </p>
        </div>
      </motion.section>

      {/* Search input */}
      <motion.section variants={itemVariants}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 text-lg"
          />
        </div>
      </motion.section>

      {/* Results */}
      <motion.section variants={itemVariants}>
        {searchQuery.trim() === '' ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              Start typing to search your memories
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <Brain className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              No memories found matching &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </p>

            {results.map((memory: MemoryCard) => (
              <motion.div
                key={memory.id}
                whileHover={{ x: 4 }}
                className="bg-card border border-border rounded-lg p-6 cursor-pointer transition-all hover:border-accent/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Brain className="h-5 w-5 text-accent flex-shrink-0" />
                      <h3 className="font-semibold text-lg text-foreground">
                        {memory.title}
                      </h3>
                      <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent flex-shrink-0">
                        {memory.category}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-3">
                      {memory.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {memory.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className={`text-xs px-3 py-1 rounded-full transition-colors ${
                            searchQuery.toLowerCase().includes(tag.toLowerCase())
                              ? 'bg-accent/20 text-accent border border-accent/30'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDate(memory.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </motion.div>
  )
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  })
}
