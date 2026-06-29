import { TimelineEvent, Priority, Source, EventType } from '@/lib/timeline-types'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface TimelineFiltersProps {
  selectedTypes: Set<EventType>
  selectedPriorities: Set<Priority>
  selectedSources: Set<Source>
  selectedWorkspaces: Set<string>
  onTypeChange: (type: EventType) => void
  onPriorityChange: (priority: Priority) => void
  onSourceChange: (source: Source) => void
  onWorkspaceChange: (workspace: string) => void
  onClearAll: () => void
  availableWorkspaces: string[]
}

const eventTypes: EventType[] = ['Email', 'Slack', 'GitHub', 'Calendar', 'Meeting', 'Voice', 'Document']
const priorities: Priority[] = ['high', 'medium', 'low']
const sources: Source[] = ['gmail', 'slack', 'github', 'calendar', 'teams', 'voice', 'documents']

export function TimelineFilters({
  selectedTypes,
  selectedPriorities,
  selectedSources,
  selectedWorkspaces,
  onTypeChange,
  onPriorityChange,
  onSourceChange,
  onWorkspaceChange,
  onClearAll,
  availableWorkspaces,
}: TimelineFiltersProps) {
  const activeFilterCount = selectedTypes.size + selectedPriorities.size + selectedSources.size + selectedWorkspaces.size

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs">
            Clear all ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Event Types */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Event Type</label>
        <div className="flex flex-wrap gap-2">
          {eventTypes.map((type) => (
            <Button
              key={type}
              variant={selectedTypes.has(type) ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTypeChange(type)}
              className="text-xs"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Priority</label>
        <div className="flex flex-wrap gap-2">
          {priorities.map((priority) => (
            <Button
              key={priority}
              variant={selectedPriorities.has(priority) ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPriorityChange(priority)}
              className="text-xs capitalize"
            >
              {priority}
            </Button>
          ))}
        </div>
      </div>

      {/* Source */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Source</label>
        <div className="flex flex-wrap gap-2">
          {sources.map((source) => (
            <Button
              key={source}
              variant={selectedSources.has(source) ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSourceChange(source)}
              className="text-xs capitalize"
            >
              {source}
            </Button>
          ))}
        </div>
      </div>

      {/* Workspace */}
      {availableWorkspaces.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Workspace</label>
          <div className="flex flex-wrap gap-2">
            {availableWorkspaces.map((workspace) => (
              <Button
                key={workspace}
                variant={selectedWorkspaces.has(workspace) ? 'default' : 'outline'}
                size="sm"
                onClick={() => onWorkspaceChange(workspace)}
                className="text-xs"
              >
                {workspace}
              </Button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
