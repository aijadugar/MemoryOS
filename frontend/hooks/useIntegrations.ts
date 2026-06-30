import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { integrationsService } from '@/services/integrations'
import { Integration } from '@/lib/integration-types'

const iconMap: Record<string, string> = {
  github: 'Github',
  slack: 'MessageSquare',
  gmail: 'Mail',
  google_drive: 'HardDrive',
  calendar: 'Calendar',
}

export function mapIntegration(item: any): Integration {
  const connected = item.connected || item.status === 'connected'
  return {
    id: item.slug || item.id,
    name: item.name,
    description: item.description,
    logo: iconMap[item.slug] || item.icon || 'Zap',
    status: connected ? 'connected' : item.status === 'error' ? 'error' : item.status === 'syncing' ? 'pending' : 'disconnected',
    lastSync: item.last_sync ? new Date(item.last_sync).toLocaleString() : undefined,
    statistics: {
      synced: item.metadata?.synced || 0,
      updated: item.metadata?.updated || 0,
      errors: item.status === 'error' ? 1 : 0,
    },
    category: item.metadata?.category || 'productivity',
    color: item.metadata?.color || '#3B82F6',
  }
}

export function useIntegrations() {
  const queryClient = useQueryClient()
  const integrations = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => (await integrationsService.list()).data.map(mapIntegration),
  })
  const status = useQuery({ queryKey: ['integrations', 'status'], queryFn: integrationsService.status })
  const connect = useMutation({
    mutationFn: integrationsService.connect,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integrations'] }),
  })
  const disconnect = useMutation({
    mutationFn: integrationsService.disconnect,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integrations'] }),
  })
  const sync = useMutation({
    mutationFn: integrationsService.sync,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integrations'] }),
  })

  return { integrations, status, connect, disconnect, sync }
}
