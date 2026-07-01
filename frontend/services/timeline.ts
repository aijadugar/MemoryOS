import { api } from '@/lib/api'

export type TimelineParams = {
  page?: number
  limit?: number
  q?: string
  type?: string
  source?: string
  start_date?: string
  end_date?: string
}

export const timelineService = {
  list: async (params: TimelineParams = {}) => (await api.get('/timeline', { params })).data,
  search: async (q: string) => (await api.get('/timeline/search', { params: { q } })).data,
  filter: async (params: TimelineParams) => (await api.get('/timeline/filter', { params })).data,
  grouped: async () => (await api.get('/timeline/grouped')).data,
  stats: async () => (await api.get('/timeline/stats')).data,
}
