export type EventType = 'Email' | 'Slack' | 'GitHub' | 'Calendar' | 'Meeting' | 'Voice' | 'Document'

export type Priority = 'high' | 'medium' | 'low'

export type Source = 'gmail' | 'slack' | 'github' | 'calendar' | 'teams' | 'voice' | 'documents'

export interface TimelineEvent {
  id: string
  type: EventType
  title: string
  description: string
  timestamp: Date
  priority: Priority
  source: Source
  workspace?: string
  icon?: string
  color?: string
  metadata?: Record<string, any>
}
