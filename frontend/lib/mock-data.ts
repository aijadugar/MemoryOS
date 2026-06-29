export const mockNotifications = [
  {
    id: '1',
    title: 'New memory created',
    description: 'You created a new memory entry',
    type: 'success' as const,
    timestamp: new Date(Date.now() - 5 * 60000),
    read: false,
  },
  {
    id: '2',
    title: 'Memory synced',
    description: 'Your memories have been synced to Supabase',
    type: 'info' as const,
    timestamp: new Date(Date.now() - 15 * 60000),
    read: false,
  },
  {
    id: '3',
    title: 'Search completed',
    description: 'Your search found 12 results',
    type: 'info' as const,
    timestamp: new Date(Date.now() - 1 * 3600000),
    read: true,
  },
];

export const mockMemories = [
  {
    id: '1',
    title: 'Project Launch Meeting',
    description: 'Discussed Q1 roadmap and sprint planning',
    category: 'Work',
    timestamp: new Date(Date.now() - 2 * 3600000),
    tags: ['meeting', 'planning', 'q1'],
  },
  {
    id: '2',
    title: 'Coffee with Alex',
    description: 'Catchup about current projects and ideas',
    category: 'Personal',
    timestamp: new Date(Date.now() - 1 * 86400000),
    tags: ['coffee', 'friends'],
  },
  {
    id: '3',
    title: 'API Integration Complete',
    description: 'Successfully integrated Supabase with the dashboard',
    category: 'Work',
    timestamp: new Date(Date.now() - 3 * 86400000),
    tags: ['development', 'supabase', 'api'],
  },
];

export const mockStats = [
  {
    label: 'Total Memories',
    value: '1,247',
    change: '+12%',
    positive: true,
  },
  {
    label: 'This Week',
    value: '42',
    change: '+8%',
    positive: true,
  },
  {
    label: 'Search Queries',
    value: '156',
    change: '-4%',
    positive: false,
  },
  {
    label: 'Integration Status',
    value: 'Connected',
    change: 'Active',
    positive: true,
  },
];
