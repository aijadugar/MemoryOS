'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedTheme = (localStorage.getItem('theme') as Theme) || 'system'
    setTheme(storedTheme)
    applyTheme(storedTheme)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement

    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (systemDark) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    } else if (newTheme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  const toggleTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <div data-theme={theme}>
      {children}
    </div>
  )
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    setTheme((localStorage.getItem('theme') as Theme) || 'system')
  }, [])

  const toggleTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    const html = document.documentElement

    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (systemDark) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    } else if (newTheme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  return { theme, toggleTheme }
}
