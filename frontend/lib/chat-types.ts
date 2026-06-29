export interface Citation {
  id: string
  title: string
  url: string
  domain: string
  favicon?: string
  snippet?: string
}

export interface MemoryReference {
  id: string
  title: string
  category: string
  snippet: string
  link?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  citations?: Citation[]
  memoryReferences?: MemoryReference[]
  isStreaming?: boolean
  error?: string
  files?: {
    name: string
    type: string
    size: number
  }[]
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  isBookmarked: boolean
}
