'use client'

import { config } from '@/lib/config'
import { mockStats, mockMemories } from '@/lib/mock-data'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

export default function Dashboard() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome section */}
      <motion.section variants={itemVariants}>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
            Welcome to {config.appName}
          </h1>
          <p className="text-muted-foreground text-lg">
            Your intelligent memory management platform. Organize, search, and leverage your memories.
          </p>
        </div>
      </motion.section>

      {/* Stats grid */}
      <motion.section variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockStats.map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    stat.positive
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}
                >
                  {stat.positive ? (
                    <TrendingUp className="h-6 w-6" />
                  ) : (
                    <TrendingDown className="h-6 w-6" />
                  )}
                </div>
              </div>
              <p
                className={`text-xs mt-4 ${
                  stat.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {stat.change}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Recent memories section */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Recent Memories</h2>
            <p className="text-sm text-muted-foreground">Your latest memory entries</p>
          </div>
          <Link href="/memory">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        <div className="space-y-3">
          {mockMemories.slice(0, 3).map((memory, idx) => (
            <motion.div
              key={memory.id}
              whileHover={{ x: 4 }}
              className="bg-card border border-border rounded-lg p-4 cursor-pointer transition-all hover:border-accent/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="h-4 w-4 text-accent flex-shrink-0" />
                    <h3 className="font-semibold text-foreground truncate">
                      {memory.title}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent flex-shrink-0">
                      {memory.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                    {memory.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {memory.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
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
      </motion.section>

      {/* Quick actions */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 rounded-lg p-8 text-center"
        >
          <Brain className="h-8 w-8 text-accent mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Create Memory</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start capturing your thoughts and ideas
          </p>
          <Link href="/memory">
            <Button className="bg-accent hover:bg-accent/90">New Memory</Button>
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-lg p-8 text-center"
        >
          <div className="h-8 w-8 text-primary mx-auto mb-3 text-2xl">🔍</div>
          <h3 className="font-semibold text-foreground mb-2">Search Memories</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Find anything in your memory database instantly
          </p>
          <Link href="/search">
            <Button variant="outline">Search</Button>
          </Link>
        </motion.div>
      </motion.section>
    </motion.div>
  )
}

function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (hours < 1) return 'Today'
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return date.toLocaleDateString()
}
