import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { timelineService } from '@/services/timeline'
import { TimelineEvent } from '@/lib/timeline-types'

const typeMap: Record<string, TimelineEvent['type']> = {
  email: 'Email',
  slack: 'Slack',
  github: 'GitHub',
  calendar: 'Calendar',
  meeting: 'Meeting',
  voice: 'Voice',
  document: 'Document',
}

const colorMap: Record<string, string> = {
  Email: 'bg-blue-500',
  Slack: 'bg-purple-500',
  GitHub: 'bg-gray-700',
  Calendar: 'bg-orange-500',
  Meeting: 'bg-green-500',
  Voice: 'bg-pink-500',
  Document: 'bg-red-500',
}

export function mapTimelineEvent(event: any): TimelineEvent {
  const type = typeMap[String(event.type).toLowerCase()] || event.type || 'Document'
  return {
    id: event.id,
    type,
    title: event.title,
    description: event.description,
    timestamp: new Date(event.timestamp),
    priority: event.metadata?.priority || 'medium',
    source: event.source,
    workspace: event.metadata?.workspace,
    icon: event.icon,
    color: colorMap[type] || 'bg-primary',
    metadata: event.metadata || {},
  }
}

export function useTimeline(limit = 20) {
  const events = useInfiniteQuery({
    queryKey: ['timeline', limit],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => timelineService.list({ page: pageParam, limit }),
    getNextPageParam: (lastPage) => (lastPage.has_next ? lastPage.page + 1 : undefined),
  })
  const stats = useQuery({ queryKey: ['timeline', 'stats'], queryFn: timelineService.stats })

  return { events, stats }
}
