'use client'

import { mockMemories } from '@/lib/mock-data'
import { motion } from 'framer-motion'
import { Plus, Filter, Brain, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

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

export default function MemoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [...new Set(mockMemories.map((m) => m.category))]

  const filtered = selectedCategory
    ? mockMemories.filter((m) => m.category === selectedCategory)
    : mockMemories

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.section variants={itemVariants}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              Memory Browser
            </h1>
            <p className="text-muted-foreground">
              Manage and organize your memory entries
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-accent hover:bg-accent/90 gap-2">
              <Plus className="h-5 w-5" />
              New Memory
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Filters */}
      <motion.section variants={itemVariants}>
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </motion.section>

      {/* Memories list */}
      <motion.section variants={itemVariants}>
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No memories found</p>
            </div>
          ) : (
            filtered.map((memory, idx) => (
              <motion.div
                key={memory.id}
                whileHover={{ x: 4 }}
                className="bg-card border border-border rounded-lg p-6 cursor-pointer transition-all hover:border-accent/50 group"
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
                    <p className="text-muted-foreground mb-4">
                      {memory.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {memory.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(memory.timestamp)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Memories</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {mockMemories.length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Categories</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {categories.length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Tags</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {new Set(mockMemories.flatMap((m) => m.tags)).size}
            </p>
          </div>
        </div>
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
