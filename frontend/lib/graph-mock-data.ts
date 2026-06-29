import { GraphData, GraphNode, GraphEdge } from './graph-types'

export const createMockGraphData = (): GraphData => {
  const nodes: GraphNode[] = [
    // Companies
    {
      id: 'company-1',
      label: 'Acme Corporation',
      type: 'company',
      metadata: {
        description: 'Leading technology company',
        website: 'acme.com',
        employees: 500,
        founded: '2015',
      },
      connections: ['company-2', 'meeting-1', 'meeting-2', 'email-1'],
    },
    {
      id: 'company-2',
      label: 'Tech Innovations Inc',
      type: 'company',
      metadata: {
        description: 'AI and machine learning solutions',
        website: 'techinnovations.io',
        employees: 250,
        founded: '2018',
      },
      connections: ['company-1', 'meeting-3', 'document-1'],
    },
    {
      id: 'company-3',
      label: 'CloudBase Systems',
      type: 'company',
      metadata: {
        description: 'Cloud infrastructure provider',
        website: 'cloudbase.com',
        employees: 800,
        founded: '2012',
      },
      connections: ['meeting-2', 'github-1', 'document-2'],
    },
    {
      id: 'company-4',
      label: 'DataViz Analytics',
      type: 'company',
      metadata: {
        description: 'Data visualization and analytics',
        website: 'dataviz.io',
        employees: 150,
        founded: '2020',
      },
      connections: ['meeting-1', 'email-2', 'document-3'],
    },
    {
      id: 'company-5',
      label: 'SecureNet Security',
      type: 'company',
      metadata: {
        description: 'Cybersecurity solutions provider',
        website: 'securenet.io',
        employees: 300,
        founded: '2016',
      },
      connections: ['meeting-4', 'github-2', 'email-3'],
    },

    // Meetings
    {
      id: 'meeting-1',
      label: 'Q1 Strategic Planning',
      type: 'meeting',
      metadata: {
        date: '2024-01-15',
        time: '10:00 AM',
        attendees: ['John Smith', 'Sarah Johnson', 'Mike Chen'],
        status: 'completed',
        notes: 'Discussed 2024 roadmap and priorities',
      },
      connections: ['company-1', 'company-4', 'email-1', 'calendar-1'],
    },
    {
      id: 'meeting-2',
      label: 'Partnership Discussion',
      type: 'meeting',
      metadata: {
        date: '2024-01-20',
        time: '2:00 PM',
        attendees: ['Alice Wong', 'Bob Martinez'],
        status: 'completed',
        notes: 'Partnership opportunities with CloudBase',
      },
      connections: ['company-1', 'company-3', 'email-2'],
    },
    {
      id: 'meeting-3',
      label: 'AI Integration Review',
      type: 'meeting',
      metadata: {
        date: '2024-02-05',
        time: '11:00 AM',
        attendees: ['Dr. Lisa Park', 'James Wilson'],
        status: 'scheduled',
        notes: 'Review of AI model integration',
      },
      connections: ['company-2', 'github-1', 'document-1'],
    },
    {
      id: 'meeting-4',
      label: 'Security Audit Meeting',
      type: 'meeting',
      metadata: {
        date: '2024-02-10',
        time: '3:00 PM',
        attendees: ['Security Team', 'Audit Team'],
        status: 'scheduled',
        notes: 'Annual security audit planning',
      },
      connections: ['company-5', 'email-3', 'document-4'],
    },
    {
      id: 'meeting-5',
      label: 'Product Launch Kickoff',
      type: 'meeting',
      metadata: {
        date: '2024-02-15',
        time: '9:00 AM',
        attendees: ['Product Team', 'Marketing', 'Engineering'],
        status: 'scheduled',
        notes: 'Launch preparation and timeline',
      },
      connections: ['github-2', 'email-4', 'calendar-2'],
    },

    // Emails
    {
      id: 'email-1',
      label: 'Meeting Follow-up: Q1 Goals',
      type: 'email',
      metadata: {
        date: '2024-01-15',
        from: 'john@acme.com',
        to: 'team@acme.com',
        subject: 'Follow-up: Q1 Goals and Objectives',
        summary: 'Action items from strategic planning meeting',
      },
      connections: ['meeting-1', 'company-1'],
    },
    {
      id: 'email-2',
      label: 'Partnership Proposal',
      type: 'email',
      metadata: {
        date: '2024-01-22',
        from: 'alice@company1.com',
        to: 'partnerships@company4.com',
        subject: 'Strategic Partnership Proposal',
        summary: 'Detailed partnership terms and benefits',
      },
      connections: ['meeting-2', 'company-4', 'document-3'],
    },
    {
      id: 'email-3',
      label: 'Security Assessment Results',
      type: 'email',
      metadata: {
        date: '2024-02-08',
        from: 'security@securenet.io',
        to: 'admin@acme.com',
        subject: 'Q1 Security Assessment Results',
        summary: 'Annual security audit findings',
      },
      connections: ['meeting-4', 'company-5'],
    },
    {
      id: 'email-4',
      label: 'Launch Timeline and Deliverables',
      type: 'email',
      metadata: {
        date: '2024-02-12',
        from: 'product@acme.com',
        to: 'team@acme.com',
        subject: 'Product Launch - Final Timeline',
        summary: 'Finalized launch date and all deliverables',
      },
      connections: ['meeting-5', 'document-5'],
    },

    // Calendar Events
    {
      id: 'calendar-1',
      label: 'Q1 Planning Session',
      type: 'calendar',
      metadata: {
        date: '2024-01-15',
        time: '10:00 AM - 11:30 AM',
        location: 'Conference Room A',
        status: 'completed',
        description: 'Quarterly planning and goal setting',
      },
      connections: ['meeting-1', 'email-1'],
    },
    {
      id: 'calendar-2',
      label: 'Product Launch Event',
      type: 'calendar',
      metadata: {
        date: '2024-03-01',
        time: '10:00 AM - 2:00 PM',
        location: 'Virtual',
        status: 'scheduled',
        description: 'Official product launch announcement',
      },
      connections: ['meeting-5', 'github-2'],
    },
    {
      id: 'calendar-3',
      label: 'Engineering Sync',
      type: 'calendar',
      metadata: {
        date: '2024-02-20',
        time: '2:00 PM - 3:00 PM',
        location: 'Virtual',
        status: 'scheduled',
        description: 'Weekly engineering team sync',
      },
      connections: ['github-1', 'document-2'],
    },
    {
      id: 'calendar-4',
      label: 'Board Meeting',
      type: 'calendar',
      metadata: {
        date: '2024-03-05',
        time: '9:00 AM - 11:00 AM',
        location: 'HQ Conference Room',
        status: 'scheduled',
        description: 'Quarterly board meeting',
      },
      connections: ['document-1', 'email-4'],
    },

    // GitHub Projects
    {
      id: 'github-1',
      label: 'AI Model Integration',
      type: 'github',
      metadata: {
        repository: 'acme/ai-integration',
        language: 'Python',
        status: 'in-progress',
        commits: 245,
        contributors: 8,
        lastUpdated: '2024-02-18',
      },
      connections: ['meeting-3', 'company-2', 'company-3'],
    },
    {
      id: 'github-2',
      label: 'Cloud Infrastructure',
      type: 'github',
      metadata: {
        repository: 'acme/cloud-infra',
        language: 'TypeScript',
        status: 'active',
        commits: 512,
        contributors: 12,
        lastUpdated: '2024-02-19',
      },
      connections: ['meeting-5', 'company-5', 'calendar-2'],
    },
    {
      id: 'github-3',
      label: 'Documentation Site',
      type: 'github',
      metadata: {
        repository: 'acme/docs-site',
        language: 'JavaScript',
        status: 'active',
        commits: 89,
        contributors: 5,
        lastUpdated: '2024-02-15',
      },
      connections: ['document-2', 'document-3'],
    },
    {
      id: 'github-4',
      label: 'Security Tools',
      type: 'github',
      metadata: {
        repository: 'acme/security-tools',
        language: 'Go',
        status: 'maintenance',
        commits: 156,
        contributors: 4,
        lastUpdated: '2024-02-10',
      },
      connections: ['company-5', 'document-4'],
    },

    // Documents
    {
      id: 'document-1',
      label: 'AI Integration Architecture',
      type: 'document',
      metadata: {
        type: 'Technical Spec',
        createdBy: 'Dr. Lisa Park',
        date: '2024-02-01',
        status: 'approved',
        pages: 24,
      },
      connections: ['company-2', 'meeting-3', 'github-1'],
    },
    {
      id: 'document-2',
      label: 'Cloud Infrastructure Design',
      type: 'document',
      metadata: {
        type: 'Architecture Document',
        createdBy: 'James Wilson',
        date: '2024-01-28',
        status: 'review',
        pages: 18,
      },
      connections: ['company-3', 'github-1', 'github-3'],
    },
    {
      id: 'document-3',
      label: 'Partnership Agreement',
      type: 'document',
      metadata: {
        type: 'Legal Document',
        createdBy: 'Legal Team',
        date: '2024-01-25',
        status: 'signed',
        pages: 12,
      },
      connections: ['company-4', 'email-2', 'meeting-2'],
    },
    {
      id: 'document-4',
      label: 'Security Audit Report',
      type: 'document',
      metadata: {
        type: 'Audit Report',
        createdBy: 'SecureNet Security',
        date: '2024-02-08',
        status: 'completed',
        pages: 35,
      },
      connections: ['company-5', 'meeting-4', 'email-3'],
    },
    {
      id: 'document-5',
      label: 'Product Launch Plan',
      type: 'document',
      metadata: {
        type: 'Project Plan',
        createdBy: 'Product Team',
        date: '2024-02-12',
        status: 'active',
        pages: 28,
      },
      connections: ['meeting-5', 'github-2', 'email-4'],
    },
  ]

  const edges: GraphEdge[] = [
    // Company connections
    { id: 'edge-1', source: 'company-1', target: 'company-2', type: 'connection' },
    { id: 'edge-2', source: 'company-1', target: 'company-3', type: 'connection' },
    { id: 'edge-3', source: 'company-1', target: 'company-4', type: 'connection' },
    { id: 'edge-4', source: 'company-1', target: 'company-5', type: 'connection' },

    // Company to meeting
    { id: 'edge-5', source: 'company-1', target: 'meeting-1', type: 'related' },
    { id: 'edge-6', source: 'company-1', target: 'meeting-2', type: 'related' },
    { id: 'edge-7', source: 'company-2', target: 'meeting-3', type: 'related' },
    { id: 'edge-8', source: 'company-3', target: 'meeting-2', type: 'related' },
    { id: 'edge-9', source: 'company-5', target: 'meeting-4', type: 'related' },

    // Meeting to email
    { id: 'edge-10', source: 'meeting-1', target: 'email-1', type: 'mentioned' },
    { id: 'edge-11', source: 'meeting-2', target: 'email-2', type: 'mentioned' },
    { id: 'edge-12', source: 'meeting-4', target: 'email-3', type: 'mentioned' },
    { id: 'edge-13', source: 'meeting-5', target: 'email-4', type: 'mentioned' },

    // Meeting to calendar
    { id: 'edge-14', source: 'meeting-1', target: 'calendar-1', type: 'connection' },
    { id: 'edge-15', source: 'meeting-5', target: 'calendar-2', type: 'connection' },

    // Company to document
    { id: 'edge-16', source: 'company-2', target: 'document-1', type: 'related' },
    { id: 'edge-17', source: 'company-3', target: 'document-2', type: 'related' },
    { id: 'edge-18', source: 'company-4', target: 'document-3', type: 'related' },
    { id: 'edge-19', source: 'company-5', target: 'document-4', type: 'related' },

    // Company to github
    { id: 'edge-20', source: 'company-3', target: 'github-1', type: 'related' },
    { id: 'edge-21', source: 'company-5', target: 'github-2', type: 'related' },

    // Document to github
    { id: 'edge-22', source: 'document-1', target: 'github-1', type: 'related' },
    { id: 'edge-23', source: 'document-2', target: 'github-3', type: 'related' },
    { id: 'edge-24', source: 'document-4', target: 'github-4', type: 'related' },

    // Email to document
    { id: 'edge-25', source: 'email-2', target: 'document-3', type: 'related' },
    { id: 'edge-26', source: 'email-4', target: 'document-5', type: 'related' },

    // Calendar to document
    { id: 'edge-27', source: 'calendar-2', target: 'document-5', type: 'related' },
    { id: 'edge-28', source: 'calendar-4', target: 'document-1', type: 'related' },
  ]

  return { nodes, edges }
}
