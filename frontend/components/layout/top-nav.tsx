'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Moon,
  Sun,
  Monitor,
  Search,
  Command,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import { useDashboard } from '@/hooks/useDashboard'

type Theme = 'light' | 'dark' | 'system'

export function TopNav() {
  const { theme, toggleTheme } = useTheme()
  const { activity } = useDashboard()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notifications = (activity.data || []).slice(0, 5).map((item: any) => ({
    id: `${item.type}-${item.timestamp}`,
    type: item.type,
    title: item.title,
    description: item.type,
    timestamp: new Date(item.timestamp),
  }))
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setUnreadCount(notifications.length)
  }, [notifications.length])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 right-0 left-0 lg:left-80 h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 z-30"
    >
      {/* Left section - Search */}
      <div className="hidden md:flex flex-1 items-center gap-2 bg-muted rounded-lg px-3 py-2 max-w-xs lg:max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search memories..."
          className="bg-transparent outline-none text-sm w-full"
        />
        <span className="text-xs text-muted-foreground">
          <Command className="h-3 w-3 inline" />K
        </span>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Theme selector */}
        <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={theme === 'light' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => toggleTheme('light')}
            className="h-7 w-7 p-0"
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => toggleTheme('dark')}
            className="h-7 w-7 p-0"
          >
            <Moon className="h-4 w-4" />
          </Button>
          <Button
            variant={theme === 'system' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => toggleTheme('system')}
            className="h-7 w-7 p-0"
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <motion.span
                layoutId="notification-badge"
                className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
              />
            )}
          </Button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-40"
              >
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 && (
                    <div className="px-4 py-3 text-sm text-muted-foreground">No recent activity</div>
                  )}
                  {notifications.map((notification: any) => (
                    <motion.div
                      key={notification.id}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      className="px-4 py-3 border-b border-border last:border-b-0 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            notification.type === 'success'
                              ? 'bg-green-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {notification.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setUnreadCount(0)}
                  >
                    Mark all as read
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </motion.header>
  )
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}
