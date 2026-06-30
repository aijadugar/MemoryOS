import { api } from '@/lib/api'

export const documentsService = {
  list: async () => (await api.get('/documents')).data,
  get: async (id: string) => (await api.get(`/documents/${id}`)).data,
  summary: async (id: string) => (await api.get(`/documents/${id}/summary`)).data,
  keywords: async (id: string) => (await api.get(`/documents/${id}/keywords`)).data,
  stats: async () => (await api.get('/documents/stats')).data,
  upload: async (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    formData.append('file', file)
    return (
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100))
        },
      })
    ).data
  },
  remove: async (id: string) => (await api.delete(`/documents/${id}`)).data,
}
