import { useQuery } from '@tanstack/react-query'
import { workspaceService } from '@/services/workspace'

export function useWorkspace() {
  const me = useQuery({ queryKey: ['users', 'me'], queryFn: workspaceService.me })
  const workspace = useQuery({ queryKey: ['workspace'], queryFn: workspaceService.workspace })
  const summary = useQuery({ queryKey: ['workspace', 'summary'], queryFn: workspaceService.summary })

  return { me, workspace, summary }
}
