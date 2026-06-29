'use client'

import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { Citation } from '@/lib/chat-types'

interface CitationCardProps {
  citation: Citation
  index?: number
}

export function CitationCard({ citation, index = 0 }: CitationCardProps) {
  return (
    <motion.a
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ translateY: -2 }}
      className="inline-flex items-start gap-3 px-3 py-2 rounded-lg border border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted flex-shrink-0">
        <span className="text-base">{citation.favicon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {citation.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {citation.domain}
        </p>
        {citation.snippet && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {citation.snippet}
          </p>
        )}
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
    </motion.a>
  )
}
