'use client'

import React from 'react'
import { useReactFlow } from 'reactflow'
import { ZoomIn, ZoomOut, Maximize, RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GraphControlsProps {
  onSearchChange?: (query: string) => void
  searchQuery?: string
}

export function GraphControls({ onSearchChange, searchQuery }: GraphControlsProps) {
  const { zoomIn, zoomOut, fitView, getZoom, setCenter } = useReactFlow()
  const zoom = getZoom?.()

  const handleReset = () => {
    fitView({ padding: 0.1, duration: 800 })
  }

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-card border border-border rounded-lg p-3 md:flex-row md:gap-1 md:p-2">
      {/* Search input */}
      <div className="flex items-center gap-2 bg-input rounded px-3 py-2">
        <Search size={16} className="text-muted-foreground" />
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery || ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="bg-transparent text-sm outline-none w-32 md:w-40"
        />
      </div>

      {/* Zoom controls */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => zoomIn()}
        title="Zoom in"
        className="h-9 w-9 p-0"
      >
        <ZoomIn size={18} />
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => zoomOut()}
        title="Zoom out"
        className="h-9 w-9 p-0"
      >
        <ZoomOut size={18} />
      </Button>

      {/* Fit view */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleReset}
        title="Fit to view"
        className="h-9 w-9 p-0"
      >
        <Maximize size={18} />
      </Button>

      {/* Reset */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleReset}
        title="Reset view"
        className="h-9 w-9 p-0"
      >
        <RotateCcw size={18} />
      </Button>
    </div>
  )
}
