'use client'

import { motion } from 'framer-motion'
import { useDashboard } from '@/hooks/useDashboard'

interface SuggestedPromptsProps {
  onSelectPrompt: (text: string) => void
}

export function SuggestedPrompts({ onSelectPrompt }: SuggestedPromptsProps) {
  const { suggestions } = useDashboard()
  const suggestedPrompts = (suggestions.data || []).map((text: string) => ({ text, icon: '*' }))
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="mb-6"
    >
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Try these prompts
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestedPrompts.map((prompt: { text: string; icon: string }, index: number) => (
          <motion.button
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectPrompt(prompt.text)}
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 bg-card hover:bg-muted transition-colors text-left group"
          >
            <span className="text-xl flex-shrink-0">{prompt.icon}</span>
            <span className="text-sm text-foreground group-hover:text-primary transition-colors">
              {prompt.text}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
