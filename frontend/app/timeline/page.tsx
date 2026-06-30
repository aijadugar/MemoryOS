'use client'

import { useState, useEffect, useRef } from 'react'
import { TimelineEvent, EventType, Priority, Source } from '@/lib/timeline-types'
import { EventCard } from '@/components/timeline/event-card'
import { TimelineFilters } from '@/components/timeline/timeline-filters'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Search, ChevronDown } from 'lucide-react'
import { mapTimelineEvent, useTimeline } from '@/hooks/useTimeline'

export default function TimelinePage() {
  const { events: timelineQuery } = useTimeline()
  const events = (timelineQuery.data?.pages.flatMap((page) => page.events) || []).map(mapTimelineEvent)
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<Set<EventType>>(new Set())
  const [selectedPriorities, setSelectedPriorities] = useState<Set<Priority>>(new Set())
  const [selectedSources, setSelectedSources] = useState<Set<Source>>(new Set())
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<Set<string>>(new Set())
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  })
  const observerTarget = useRef<HTMLDivElement>(null)

  // Get unique workspaces
  const availableWorkspaces = Array.from(new Set(events.map((e) => e.workspace).filter(Boolean))) as string[]

  // Filter events
  useEffect(() => {
    let result = events

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.workspace?.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (selectedTypes.size > 0) {
      result = result.filter((event) => selectedTypes.has(event.type))
    }

    // Priority filter
    if (selectedPriorities.size > 0) {
      result = result.filter((event) => selectedPriorities.has(event.priority))
    }

    // Source filter
    if (selectedSources.size > 0) {
      result = result.filter((event) => selectedSources.has(event.source))
    }

    // Workspace filter
    if (selectedWorkspaces.size > 0) {
      result = result.filter((event) => selectedWorkspaces.has(event.workspace || ''))
    }

    // Date range filter
    if (dateRange.start || dateRange.end) {
      result = result.filter((event) => {
        if (dateRange.start && event.timestamp < dateRange.start) return false
        if (dateRange.end && event.timestamp > dateRange.end) return false
        return true
      })
    }

    // Sort by timestamp (newest first)
    result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    setFilteredEvents(result)
  }, [events, searchQuery, selectedTypes, selectedPriorities, selectedSources, selectedWorkspaces, dateRange])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && timelineQuery.hasNextPage && !timelineQuery.isFetchingNextPage) {
          timelineQuery.fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [timelineQuery])

  const handleTypeChange = (type: EventType) => {
    setSelectedTypes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(type)) {
        newSet.delete(type)
      } else {
        newSet.add(type)
      }
      return newSet
    })
  }

  const handlePriorityChange = (priority: Priority) => {
    setSelectedPriorities((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(priority)) {
        newSet.delete(priority)
      } else {
        newSet.add(priority)
      }
      return newSet
    })
  }

  const handleSourceChange = (source: Source) => {
    setSelectedSources((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(source)) {
        newSet.delete(source)
      } else {
        newSet.add(source)
      }
      return newSet
    })
  }

  const handleWorkspaceChange = (workspace: string) => {
    setSelectedWorkspaces((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(workspace)) {
        newSet.delete(workspace)
      } else {
        newSet.add(workspace)
      }
      return newSet
    })
  }

  const handleClearFilters = () => {
    setSelectedTypes(new Set())
    setSelectedPriorities(new Set())
    setSelectedSources(new Set())
    setSelectedWorkspaces(new Set())
    setSearchQuery('')
    setDateRange({ start: null, end: null })
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Activity Timeline</h1>
        <p className="text-muted-foreground mt-2">Track all your activities across all platforms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar filters */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <TimelineFilters
              selectedTypes={selectedTypes}
              selectedPriorities={selectedPriorities}
              selectedSources={selectedSources}
              selectedWorkspaces={selectedWorkspaces}
              onTypeChange={handleTypeChange}
              onPriorityChange={handlePriorityChange}
              onSourceChange={handleSourceChange}
              onWorkspaceChange={handleWorkspaceChange}
              onClearAll={handleClearFilters}
              availableWorkspaces={availableWorkspaces}
            />
          </div>
        </div>

        {/* Main timeline */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </motion.div>

          {/* Events count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredEvents.length} of {events.length} events
          </div>

          {/* Events list */}
          <div className="space-y-3">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => <EventCard key={event.id} event={event} />)
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <p className="text-muted-foreground">No events found</p>
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="mt-2">
                  Clear filters
                </Button>
              </motion.div>
            )}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={observerTarget} className="flex items-center justify-center py-8">
            {(timelineQuery.isLoading || timelineQuery.isFetchingNextPage) && (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="text-muted-foreground">
                <ChevronDown className="h-6 w-6" />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
