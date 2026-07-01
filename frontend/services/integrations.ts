import { api } from '@/lib/api'

export const integrationsService = {
  list: async () => (await api.get('/integrations')).data,
  status: async () => (await api.get('/integrations/status')).data,
  connect: async (slug: string) => (await api.post(`/integrations/${slug}/connect`)).data,
  disconnect: async (slug: string) => (await api.post(`/integrations/${slug}/disconnect`)).data,
  sync: async (slug: string) => (await api.post(`/integrations/${slug}/sync`)).data,
  syncAll: async () => (await api.post('/integrations/sync-all')).data,
}
