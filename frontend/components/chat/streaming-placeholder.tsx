'use client'

import { motion } from 'framer-motion'

export function StreamingPlaceholder() {
  const pulseVariants = {
    initial: { opacity: 0.6 },
    animate: { opacity: 1 },
  }

  return (
    <div className="space-y-3 py-2">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.2,
          }}
          className="h-3 bg-muted rounded-full w-full"
        />
      ))}
      <motion.div
        variants={pulseVariants}
        initial="initial"
        animate="animate"
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'reverse',
          delay: 0.6,
        }}
        className="h-3 bg-muted rounded-full w-2/3"
      />
    </div>
  )
}
