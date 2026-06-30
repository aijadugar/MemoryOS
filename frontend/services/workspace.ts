import { api } from '@/lib/api'

export const workspaceService = {
  me: async () => (await api.get('/users/me')).data,
  workspace: async () => (await api.get('/workspace')).data,
  summary: async () => (await api.get('/workspace/summary')).data,
}
