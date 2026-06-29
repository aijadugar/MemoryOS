import { TimelineEvent } from '@/lib/timeline-types'
import { motion } from 'framer-motion'
import { Mail, MessageSquare, GitBranch, Calendar, Users, Mic, FileText } from 'lucide-react'

const typeIcons: Record<TimelineEvent['type'], React.ReactNode> = {
  Email: <Mail className="h-5 w-5" />,
  Slack: <MessageSquare className="h-5 w-5" />,
  GitHub: <GitBranch className="h-5 w-5" />,
  Calendar: <Calendar className="h-5 w-5" />,
  Meeting: <Users className="h-5 w-5" />,
  Voice: <Mic className="h-5 w-5" />,
  Document: <FileText className="h-5 w-5" />,
}

interface EventCardProps {
  event: TimelineEvent
  onClose?: () => void
}

export function EventCard({ event }: EventCardProps) {
  const priorityColor = {
    high: 'bg-red-100 text-red-800 border border-red-300',
    medium: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    low: 'bg-gray-100 text-gray-800 border border-gray-300',
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow dark:hover:shadow-lg"
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${event.color} flex items-center justify-center text-white`}>
          {typeIcons[event.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground truncate">{event.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColor[event.priority]}`}>
              {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}
            </span>

            {event.workspace && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {event.workspace}
              </span>
            )}

            <span className="text-xs text-muted-foreground ml-auto">{formatDate(event.timestamp)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
