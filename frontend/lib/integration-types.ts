export type IntegrationStatus = 'connected' | 'disconnected' | 'pending' | 'error'

export interface Integration {
  id: string
  name: string
  description: string
  logo: string
  status: IntegrationStatus
  lastSync?: string
  statistics: {
    synced: number
    updated: number
    errors?: number
  }
  category: 'communication' | 'productivity' | 'development' | 'storage'
  color: string
}

export interface IntegrationAction {
  type: 'connect' | 'disconnect' | 'configure'
  label: string
}
