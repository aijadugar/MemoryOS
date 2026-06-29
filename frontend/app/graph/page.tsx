'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { createMockGraphData } from '@/lib/graph-mock-data'
import { NodeType } from '@/lib/graph-types'
import { KnowledgeGraph } from '@/components/graph/knowledge-graph'
import { NodeFilters } from '@/components/graph/node-filters'
import { NodeDetailsDrawer } from '@/components/graph/node-details-drawer'
import { Button } from '@/components/ui/button'

export default function GraphPage() {
  const graphData = useMemo(() => createMockGraphData(), [])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<NodeType[]>([
    'company',
    'meeting',
    'email',
    'calendar',
    'github',
    'document',
  ])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Handle window resize for responsive behavior
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const selectedNode = useMemo(
    () => graphData.nodes.find((n) => n.id === selectedNodeId) || null,
    [graphData.nodes, selectedNodeId]
  )

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-background overflow-hidden">
      {/* Mobile/Tablet Sidebar Toggle */}
      <div className="lg:hidden absolute top-4 left-4 z-30 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-9 w-9 p-0"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      {/* Sidebar - Filters */}
      <motion.div
        initial={isMobile ? { x: '-100%' } : false}
        animate={sidebarOpen ? { x: 0 } : isMobile ? { x: '-100%' } : { x: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`bg-card border-r border-border overflow-y-auto z-20 ${
          isMobile
            ? 'fixed left-0 top-0 bottom-0 w-64 pt-16'
            : 'w-80 md:w-64 lg:w-72'
        }`}
      >
        <div className="p-4 space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-4">Knowledge Graph</h2>
            <p className="text-xs text-muted-foreground">
              Explore connections between entities, meetings, documents, and more.
            </p>
          </div>

          <NodeFilters
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />

          {/* Search Stats */}
          {searchQuery && (
            <div className="bg-primary/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Search Results</p>
              <p className="text-sm font-semibold">
                {graphData.nodes.filter((n) =>
                  n.label
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                ).length}{' '}
                nodes found
              </p>
            </div>
          )}

          {/* Selected Node Info */}
          {selectedNode && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <p className="text-xs text-muted-foreground">Selected Node</p>
              <p className="font-semibold text-sm">{selectedNode.label}</p>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="text-xs text-primary hover:underline"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile Overlay when sidebar is open */}
      {isMobile && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-10"
        />
      )}

      {/* Main Graph Canvas */}
      <div className="flex-1 relative overflow-hidden pt-16 lg:pt-0">
        <KnowledgeGraph
          data={graphData}
          selectedNodeId={selectedNodeId}
          onNodeSelect={handleNodeSelect}
          searchQuery={searchQuery}
          activeFilters={activeFilters}
        />
      </div>

      {/* Details Drawer - Desktop */}
      <div className="hidden lg:block">
        <NodeDetailsDrawer
          node={selectedNode}
          allNodes={graphData.nodes}
          onClose={() => setSelectedNodeId(null)}
          onNodeSelect={handleNodeSelect}
          isOpen={selectedNodeId !== null}
          isMobile={false}
        />
      </div>

      {/* Details Drawer - Mobile/Tablet */}
      {isMobile && (
        <NodeDetailsDrawer
          node={selectedNode}
          allNodes={graphData.nodes}
          onClose={() => setSelectedNodeId(null)}
          onNodeSelect={handleNodeSelect}
          isOpen={selectedNodeId !== null}
          isMobile={true}
        />
      )}
    </div>
  )
}
