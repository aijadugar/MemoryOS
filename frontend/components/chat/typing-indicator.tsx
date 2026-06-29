'use client'

import { motion } from 'framer-motion'

export function TypingIndicator() {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -8 },
  }

  const containerVariants = {
    initial: 'initial',
    animate: 'animate',
  }

  return (
    <div className="flex items-center gap-1 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.1,
          }}
          className="w-2 h-2 rounded-full bg-muted-foreground"
        />
      ))}
    </div>
  )
}
