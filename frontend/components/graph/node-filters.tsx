'use client'

import React from 'react'
import { NodeType, NODE_TYPE_LABELS, NODE_TYPE_COLORS } from '@/lib/graph-types'
import { Button } from '@/components/ui/button'

interface NodeFiltersProps {
  activeFilters: NodeType[]
  onFilterChange: (filters: NodeType[]) => void
}

const NODE_TYPES: NodeType[] = ['company', 'meeting', 'email', 'calendar', 'github', 'document']

export function NodeFilters({ activeFilters, onFilterChange }: NodeFiltersProps) {
  const toggleFilter = (type: NodeType) => {
    if (activeFilters.includes(type)) {
      onFilterChange(activeFilters.filter((t) => t !== type))
    } else {
      onFilterChange([...activeFilters, type])
    }
  }

  const selectAll = () => {
    onFilterChange(NODE_TYPES)
  }

  const clearAll = () => {
    onFilterChange([])
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Filters</h3>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs text-primary hover:underline"
          >
            All
          </button>
          <button
            onClick={clearAll}
            className="text-xs text-primary hover:underline"
          >
            None
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {NODE_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => toggleFilter(type)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
              activeFilters.includes(type)
                ? 'bg-primary/10 text-primary'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: NODE_TYPE_COLORS[type],
              }}
            />
            <span className="flex-1 text-left">{NODE_TYPE_LABELS[type]}</span>
            {activeFilters.includes(type) && (
              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
