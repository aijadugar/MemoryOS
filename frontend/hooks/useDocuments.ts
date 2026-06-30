import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { documentsService } from '@/services/documents'

export function useDocuments(onUploadProgress?: (progress: number) => void) {
  const queryClient = useQueryClient()
  const documents = useQuery({ queryKey: ['documents'], queryFn: documentsService.list })
  const stats = useQuery({ queryKey: ['documents', 'stats'], queryFn: documentsService.stats })
  const upload = useMutation({
    mutationFn: (file: File) => documentsService.upload(file, onUploadProgress),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  })
  const remove = useMutation({
    mutationFn: (id: string) => documentsService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  })

  return { documents, stats, upload, remove }
}
