import { Conversation, Message, Citation, MemoryReference } from './chat-types'

const citations: Citation[] = [
  {
    id: '1',
    title: 'Understanding Knowledge Graphs',
    url: 'https://example.com/knowledge-graphs',
    domain: 'example.com',
    favicon: '📄',
    snippet: 'Knowledge graphs represent information in a connected network...',
  },
  {
    id: '2',
    title: 'Machine Learning Best Practices',
    url: 'https://docs.example.com/ml-practices',
    domain: 'docs.example.com',
    favicon: '📚',
    snippet: 'Following best practices in ML development ensures scalability...',
  },
  {
    id: '3',
    title: 'Memory Systems and Recall',
    url: 'https://research.example.com/memory',
    domain: 'research.example.com',
    favicon: '🔬',
    snippet: 'Efficient memory systems improve system performance significantly...',
  },
]

const memoryReferences: MemoryReference[] = [
  {
    id: '1',
    title: 'Knowledge Base Architecture',
    category: 'Technical',
    snippet: 'Structured approach to storing and retrieving information...',
  },
  {
    id: '2',
    title: 'System Design Principles',
    category: 'Architecture',
    snippet: 'Key principles for building scalable systems...',
  },
]

const suggestedPrompts = [
  { icon: '💭', text: 'Explain memory management systems' },
  { icon: '🔍', text: 'How do semantic search engines work?' },
  { icon: '📊', text: 'What are the best ways to organize information?' },
  { icon: '🚀', text: 'How can I improve my productivity?' },
  { icon: '🤖', text: 'How do AI assistants process context?' },
  { icon: '📚', text: 'What makes a good knowledge base?' },
]

export const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'Understanding Memory Systems',
    isBookmarked: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    messages: [
      {
        id: '1',
        role: 'user',
        content: 'How can I build an effective memory system?',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        role: 'assistant',
        content:
          'Building an effective memory system involves several key components:\n\n1. **Organization Structure**: Implement a hierarchical organization with clear categories and tags\n2. **Retrieval Methods**: Support multiple ways to find information (search, browse, filter)\n3. **Context Preservation**: Maintain relationships between memories and their sources\n4. **Regular Review**: Implement spaced repetition for reinforcement\n\nThese principles are well-established in cognitive science and proven effective in knowledge management systems.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5000),
        citations: [citations[0], citations[1]],
        memoryReferences: [memoryReferences[0]],
      },
      {
        id: '3',
        role: 'user',
        content: 'What about semantic search capabilities?',
        timestamp: new Date(Date.now() - 1.9 * 24 * 60 * 60 * 1000),
      },
      {
        id: '4',
        role: 'assistant',
        content:
          'Semantic search is crucial for modern memory systems. It goes beyond keyword matching to understand the meaning and context of queries. Key aspects include:\n\n**Implementation:**\n- Use embeddings to represent meaning numerically\n- Build vector indices for fast similarity search\n- Implement relevance ranking based on semantic distance\n\n**Benefits:**\n- Find related memories even with different wording\n- Better results for complex queries\n- Natural language understanding\n\nThis approach significantly improves information discovery and recall.',
        timestamp: new Date(Date.now() - 1.9 * 24 * 60 * 60 * 1000 + 5000),
        citations: [citations[2]],
      },
    ],
  },
  {
    id: '2',
    title: 'AI Productivity Tools',
    isBookmarked: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    messages: [
      {
        id: '1',
        role: 'user',
        content: 'What AI tools can help increase productivity?',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        role: 'assistant',
        content:
          'Modern AI tools can significantly boost productivity across different domains. Here are the most effective categories:\n\n**Writing & Documentation**\n- Grammar and style checking\n- Content generation and editing\n- Documentation automation\n\n**Analysis & Data**\n- Pattern recognition in datasets\n- Trend analysis\n- Report generation\n\n**Learning & Knowledge**\n- Personalized learning recommendations\n- Knowledge synthesis\n- Research acceleration',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 5000),
        citations: [citations[1]],
      },
    ],
  },
  {
    id: '3',
    title: 'Recent Chat',
    isBookmarked: false,
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    messages: [
      {
        id: '1',
        role: 'user',
        content: 'Tell me about your capabilities',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
      },
      {
        id: '2',
        role: 'assistant',
        content:
          'I can help you with a wide range of tasks including:\n\n• Answering questions and explaining concepts\n• Writing and editing content\n• Analyzing data and providing insights\n• Coding and technical problem-solving\n• Creative brainstorming and ideation\n• Research and information synthesis\n\nHow can I assist you today?',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000 + 3000),
      },
    ],
  },
  {
    id: '4',
    title: 'Knowledge Representation',
    isBookmarked: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    messages: [
      {
        id: '1',
        role: 'user',
        content: 'What are different ways to represent knowledge?',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: '5',
    title: 'System Architecture Discussion',
    isBookmarked: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    messages: [
      {
        id: '1',
        role: 'user',
        content: 'How should I design a scalable system?',
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
    ],
  },
]

export { suggestedPrompts }
