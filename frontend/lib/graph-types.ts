export type NodeType = 'company' | 'meeting' | 'email' | 'calendar' | 'github' | 'document'

export interface NodeMetadata {
  date?: string
  description?: string
  author?: string
  status?: string
  url?: string
  email?: string
  attendees?: string[]
  tags?: string[]
  [key: string]: any
}

export interface GraphNode {
  id: string
  label: string
  type: NodeType
  metadata: NodeMetadata
  connections: string[]
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type?: 'connection' | 'related' | 'mentioned'
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export const NODE_TYPE_COLORS: Record<NodeType, string> = {
  company: '#3B82F6',      // Blue
  meeting: '#A855F7',      // Purple
  email: '#10B981',        // Green
  calendar: '#F97316',     // Orange
  github: '#6B7280',       // Gray
  document: '#EF4444',     // Red
}

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  company: 'Company',
  meeting: 'Meeting',
  email: 'Email',
  calendar: 'Calendar',
  github: 'GitHub',
  document: 'Document',
}

export const NODE_TYPE_ICONS: Record<NodeType, string> = {
  company: 'building',
  meeting: 'video',
  email: 'mail',
  calendar: 'calendar',
  github: 'code',
  document: 'file',
}
