import { api } from '@/lib/api'

export const graphService = {
  graph: async () => (await api.get('/graph')).data,
  node: async (id: string) => (await api.get(`/graph/node/${id}`)).data,
  search: async (q: string) => (await api.get('/graph/search', { params: { q } })).data,
  related: async (id: string) => (await api.get(`/graph/related/${id}`)).data,
  expand: async (id: string) => (await api.get(`/graph/expand/${id}`)).data,
  stats: async () => (await api.get('/graph/stats')).data,
}
