import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { graphService } from '@/services/graph'
import { GraphData, NodeType } from '@/lib/graph-types'

const nodeTypeMap: Record<string, NodeType> = {
  User: 'company',
  Workspace: 'company',
  Conversation: 'meeting',
  Memory: 'document',
  Document: 'document',
  Topic: 'email',
  Keyword: 'github',
}

export function mapGraph(data: any): GraphData {
  return {
    nodes: (data?.nodes || []).map((node: any) => ({
      id: node.id,
      label: node.label,
      type: nodeTypeMap[node.type] || 'document',
      metadata: {
        ...(node.metadata || {}),
        description: node.description,
        created_at: node.created_at,
        updated_at: node.updated_at,
      },
      connections: (data?.edges || [])
        .filter((edge: any) => edge.source === node.id || edge.target === node.id)
        .map((edge: any) => (edge.source === node.id ? edge.target : edge.source)),
      position: node.position,
      data: node.data,
    })),
    edges: (data?.edges || []).map((edge: any) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.relationship,
      label: edge.label,
      animated: edge.animated,
    })),
  }
}

export function useGraph() {
  const queryClient = useQueryClient()
  const graph = useQuery({
    queryKey: ['graph'],
    queryFn: async () => mapGraph(await graphService.graph()),
  })
  const expand = useMutation({
    mutationFn: (id: string) => graphService.expand(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['graph'] }),
  })

  return { graph, expand }
}
