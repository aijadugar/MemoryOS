import { api } from '@/lib/api'

export const dashboardService = {
  summary: async () => (await api.get('/dashboard/summary')).data,
  stats: async () => (await api.get('/dashboard/stats')).data,
  activity: async () => (await api.get('/dashboard/activity')).data,
  recent: async () => (await api.get('/dashboard/recent')).data,
  suggestions: async () => {
    const response = await api.get('/dashboard/suggestions')
    return response.data?.root ?? response.data
  },
}
