'use client'

import { navigationItems } from '@/lib/config'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Brain,
  LayoutDashboard,
  Search,
  Settings,
  MessageSquare,
  Network,
  Clock,
  Puzzle,
  Mic,
  BarChart3,
  User,
} from 'lucide-react'

const iconMap = {
  Brain,
  LayoutDashboard,
  Search,
  Settings,
  MessageSquare,
  Network,
  Clock,
  Puzzle,
  Mic,
  BarChart3,
  User,
}

export function MobileNav() {
  const pathname = usePathname()

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around lg:hidden z-40"
    >
      {navigationItems.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap]
        const isActive = pathname.startsWith(item.href)

        return (
          <Link key={item.href} href={item.href} className="flex-1">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center justify-center h-full gap-1 ${
                isActive
                  ? 'text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </motion.div>
          </Link>
        )
      })}
    </motion.nav>
  )
}
