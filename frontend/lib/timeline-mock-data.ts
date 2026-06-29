import { TimelineEvent } from './timeline-types'

const generateDate = (daysAgo: number, hoursAgo: number = 0) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(date.getHours() - hoursAgo)
  return date
}

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    type: 'Email',
    title: 'Q4 Planning Discussion',
    description: 'Discussion about Q4 roadmap and priorities for next quarter',
    timestamp: generateDate(0, 2),
    priority: 'high',
    source: 'gmail',
    workspace: 'Personal',
    color: 'bg-green-500',
  },
  {
    id: '2',
    type: 'Slack',
    title: 'Team sync notes shared',
    description: 'Backend team shared their sprint planning notes in #engineering',
    timestamp: generateDate(0, 4),
    priority: 'medium',
    source: 'slack',
    workspace: 'Company Workspace',
    color: 'bg-purple-500',
  },
  {
    id: '3',
    type: 'GitHub',
    title: 'Pull request merged: Auth refactoring',
    description: 'Major refactoring of authentication system completed and merged',
    timestamp: generateDate(0, 6),
    priority: 'high',
    source: 'github',
    workspace: 'MemoryOS',
    color: 'bg-gray-800',
  },
  {
    id: '4',
    type: 'Calendar',
    title: 'Board Meeting Scheduled',
    description: 'Quarterly board review meeting for Q3 results',
    timestamp: generateDate(1, 0),
    priority: 'high',
    source: 'calendar',
    workspace: 'Company Calendar',
    color: 'bg-blue-500',
  },
  {
    id: '5',
    type: 'Meeting',
    title: 'One-on-One with Alex',
    description: 'Discussed career development and upcoming projects',
    timestamp: generateDate(1, 3),
    priority: 'medium',
    source: 'teams',
    workspace: 'Personal',
    color: 'bg-indigo-500',
  },
  {
    id: '6',
    type: 'Email',
    title: 'Project proposal feedback',
    description: 'Client provided feedback on the latest proposal submission',
    timestamp: generateDate(1, 8),
    priority: 'high',
    source: 'gmail',
    workspace: 'Client Work',
    color: 'bg-green-500',
  },
  {
    id: '7',
    type: 'Document',
    title: 'API Documentation Updated',
    description: 'Updated REST API documentation with new endpoints',
    timestamp: generateDate(2, 2),
    priority: 'medium',
    source: 'documents',
    workspace: 'MemoryOS',
    color: 'bg-red-500',
  },
  {
    id: '8',
    type: 'Voice',
    title: 'Voice note: Feature ideas',
    description: 'Recorded voice note with ideas for next sprint features',
    timestamp: generateDate(2, 5),
    priority: 'low',
    source: 'voice',
    workspace: 'Personal',
    color: 'bg-orange-500',
  },
  {
    id: '9',
    type: 'GitHub',
    title: 'Issue created: Performance optimization',
    description: 'New performance optimization task for database queries',
    timestamp: generateDate(2, 9),
    priority: 'medium',
    source: 'github',
    workspace: 'MemoryOS',
    color: 'bg-gray-800',
  },
  {
    id: '10',
    type: 'Slack',
    title: 'Design review feedback',
    description: 'Design team provided feedback on new UI mockups',
    timestamp: generateDate(3, 1),
    priority: 'medium',
    source: 'slack',
    workspace: 'Company Workspace',
    color: 'bg-purple-500',
  },
  {
    id: '11',
    type: 'Calendar',
    title: 'Conference: AI Summit 2026',
    description: 'Attending major AI and machine learning conference',
    timestamp: generateDate(5, 0),
    priority: 'medium',
    source: 'calendar',
    workspace: 'Company Calendar',
    color: 'bg-blue-500',
  },
  {
    id: '12',
    type: 'Email',
    title: 'Newsletter: Tech insights',
    description: 'New technology newsletter with industry insights',
    timestamp: generateDate(3, 4),
    priority: 'low',
    source: 'gmail',
    workspace: 'Subscriptions',
    color: 'bg-green-500',
  },
  {
    id: '13',
    type: 'Meeting',
    title: 'Investor pitch prep',
    description: 'Preparing for upcoming investor meeting next week',
    timestamp: generateDate(3, 6),
    priority: 'high',
    source: 'teams',
    workspace: 'Company',
    color: 'bg-indigo-500',
  },
  {
    id: '14',
    type: 'Document',
    title: 'Q3 Financial Report',
    description: 'Final Q3 financial report and analysis complete',
    timestamp: generateDate(4, 2),
    priority: 'high',
    source: 'documents',
    workspace: 'Finance',
    color: 'bg-red-500',
  },
  {
    id: '15',
    type: 'GitHub',
    title: 'Release v2.0.0',
    description: 'Major version release with significant new features',
    timestamp: generateDate(4, 5),
    priority: 'high',
    source: 'github',
    workspace: 'MemoryOS',
    color: 'bg-gray-800',
  },
]

// Generate additional events for infinite scroll
export const generateMoreEvents = (startId: number, count: number): TimelineEvent[] => {
  const types: TimelineEvent['type'][] = ['Email', 'Slack', 'GitHub', 'Calendar', 'Meeting', 'Voice', 'Document']
  const sources: TimelineEvent['source'][] = ['gmail', 'slack', 'github', 'calendar', 'teams', 'voice', 'documents']
  const workspaces = ['Personal', 'Company', 'Client', 'MemoryOS']
  const priorities: TimelineEvent['priority'][] = ['high', 'medium', 'low']
  const colors = ['bg-green-500', 'bg-purple-500', 'bg-gray-800', 'bg-blue-500', 'bg-indigo-500', 'bg-orange-500', 'bg-red-500']

  const events: TimelineEvent[] = []

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30) + 5
    const type = types[Math.floor(Math.random() * types.length)]
    const source = sources[Math.floor(Math.random() * sources.length)]

    events.push({
      id: `${startId + i}`,
      type,
      title: `Activity ${startId + i}: ${type} event`,
      description: `Auto-generated activity event for infinite scroll demonstration`,
      timestamp: generateDate(daysAgo),
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      source,
      workspace: workspaces[Math.floor(Math.random() * workspaces.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
    })
  }

  return events
}
