// Configuration from environment variables
export const config = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'MemoryOS',
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  enableVoice: process.env.NEXT_PUBLIC_ENABLE_VOICE === 'true',
  enableGraph: process.env.NEXT_PUBLIC_ENABLE_GRAPH === 'true',
} as const;

export const navigationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    label: 'Chat',
    href: '/chat',
    icon: 'MessageSquare',
  },
  {
    label: 'Graph',
    href: '/graph',
    icon: 'Network',
  },
  {
    label: 'Timeline',
    href: '/timeline',
    icon: 'Clock',
  },
  {
    label: 'Voice',
    href: '/voice',
    icon: 'Mic',
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: 'BarChart3',
  },
  {
    label: 'Integrations',
    href: '/integrations',
    icon: 'Puzzle',
  },
  {
    label: 'Memory',
    href: '/memory',
    icon: 'Brain',
  },
  {
    label: 'Search',
    href: '/search',
    icon: 'Search',
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: 'User',
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'Settings',
  },
] as const;
