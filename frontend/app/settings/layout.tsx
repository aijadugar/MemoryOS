'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { Sidebar } from '@/components/layout/sidebar'
import { TopNav } from '@/components/layout/top-nav'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CommandPalette } from '@/components/command-palette'
import { motion } from 'framer-motion'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <div className="flex bg-background">
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col lg:ml-80">
          <TopNav />

          {/* Page content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 mt-16 mb-16 lg:mb-0 px-4 lg:px-8 py-8 overflow-y-auto"
          >
            {children}
          </motion.main>
        </div>

        {/* Mobile bottom navigation */}
        <MobileNav />

        {/* Command palette */}
        <CommandPalette />
      </div>
    </ThemeProvider>
  )
}
