'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Command, X, ArrowRight } from 'lucide-react'

const commands = [
  { id: '1', name: 'Go to Dashboard', description: 'Navigate to dashboard', category: 'Navigation' },
  { id: '2', name: 'Go to Memory', description: 'Navigate to memory browser', category: 'Navigation' },
  { id: '3', name: 'Go to Search', description: 'Navigate to search', category: 'Navigation' },
  { id: '4', name: 'Go to Settings', description: 'Navigate to settings', category: 'Navigation' },
  { id: '5', name: 'Create Memory', description: 'Create a new memory entry', category: 'Actions' },
  { id: '6', name: 'Search Memories', description: 'Search your memory database', category: 'Actions' },
  { id: '7', name: 'Toggle Theme', description: 'Switch between light/dark mode', category: 'Settings' },
  { id: '8', name: 'Show Help', description: 'Display help documentation', category: 'Help' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(0)

  const filtered = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }

      if (!open) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelected((prev) => (prev + 1) % filtered.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelected((prev) => (prev - 1 + filtered.length) % filtered.length)
          break
        case 'Enter':
          e.preventDefault()
          // Handle command execution
          setOpen(false)
          break
        case 'Escape':
          e.preventDefault()
          setOpen(false)
          break
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, filtered.length])

  useEffect(() => {
    setSelected(0)
  }, [search])

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/50 z-50"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-50"
          >
            <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <Command className="h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Commands list */}
              <div className="max-h-96 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No commands found
                  </div>
                ) : (
                  <div>
                    {filtered.map((cmd, idx) => (
                      <motion.div
                        key={cmd.id}
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                        onClick={() => {
                          setOpen(false)
                          setSearch('')
                        }}
                        className={`px-4 py-3 cursor-pointer flex items-center justify-between gap-4 ${
                          idx === selected ? 'bg-accent/10' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{cmd.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {cmd.category} • {cmd.description}
                          </p>
                        </div>
                        {idx === selected && (
                          <motion.div
                            layoutId="command-arrow"
                            className="text-accent"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
                <span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">↑↓</kbd>
                  <span className="mx-2">to navigate</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">⏎</kbd>
                  <span className="mx-2">to select</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">esc</kbd>
                  <span className="mx-2">to close</span>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating command button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-24 lg:bottom-8 right-8 px-3 py-2 bg-card border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-2 z-40"
      >
        <Command className="h-4 w-4" />
        <span>⌘K</span>
      </motion.button>
    </>
  )
}
