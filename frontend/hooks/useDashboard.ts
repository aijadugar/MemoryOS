import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboard'

export function useDashboard() {
  const summary = useQuery({ queryKey: ['dashboard', 'summary'], queryFn: dashboardService.summary })
  const stats = useQuery({ queryKey: ['dashboard', 'stats'], queryFn: dashboardService.stats })
  const activity = useQuery({ queryKey: ['dashboard', 'activity'], queryFn: dashboardService.activity })
  const recent = useQuery({ queryKey: ['dashboard', 'recent'], queryFn: dashboardService.recent })
  const suggestions = useQuery({ queryKey: ['dashboard', 'suggestions'], queryFn: dashboardService.suggestions })

  return { summary, stats, activity, recent, suggestions }
}
