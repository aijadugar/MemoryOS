'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink } from 'lucide-react'
import { GraphNode } from '@/lib/graph-types'
import { NODE_TYPE_COLORS, NODE_TYPE_LABELS } from '@/lib/graph-types'
import { Button } from '@/components/ui/button'

interface NodeDetailsDrawerProps {
  node: GraphNode | null
  allNodes: GraphNode[]
  onClose: () => void
  onNodeSelect?: (nodeId: string) => void
  isOpen: boolean
  isMobile?: boolean
}

export function NodeDetailsDrawer({
  node,
  allNodes,
  onClose,
  onNodeSelect,
  isOpen,
  isMobile = false,
}: NodeDetailsDrawerProps) {
  if (!node) return null

  const connectedNodes = node.connections
    .map((id) => allNodes.find((n) => n.id === id))
    .filter(Boolean) as GraphNode[]

  const color = NODE_TYPE_COLORS[node.type]

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-lg z-50 max-h-[80vh] overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Details</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                  >
                    <X size={18} />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs font-semibold text-muted-foreground">
                        {NODE_TYPE_LABELS[node.type]}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{node.label}</h3>
                  </div>

                  {/* Metadata */}
                  {Object.keys(node.metadata).length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      {Object.entries(node.metadata).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <p className="text-muted-foreground capitalize">{key}</p>
                          <p className="text-foreground font-medium">
                            {Array.isArray(value)
                              ? value.join(', ')
                              : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Connected Nodes */}
                  {connectedNodes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Connected ({connectedNodes.length})</h4>
                      <div className="space-y-2">
                        {connectedNodes.map((connNode) => (
                          <button
                            key={connNode.id}
                            onClick={() => {
                              onNodeSelect?.(connNode.id)
                            }}
                            className="w-full text-left p-3 bg-muted/50 hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    NODE_TYPE_COLORS[connNode.type],
                                }}
                              />
                              <span className="text-xs text-muted-foreground">
                                {NODE_TYPE_LABELS[connNode.type]}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                              {connNode.label}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 w-80 bg-card border-l border-border overflow-y-auto z-40 shadow-lg"
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Node Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  {NODE_TYPE_LABELS[node.type]}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{node.label}</h3>
            </div>

            {/* Metadata */}
            {Object.keys(node.metadata).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Properties</h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  {Object.entries(node.metadata).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <p className="text-muted-foreground capitalize mb-1">
                        {key}
                      </p>
                      <p className="text-foreground font-medium break-words">
                        {Array.isArray(value)
                          ? value.join(', ')
                          : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connected Nodes */}
            {connectedNodes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                  Connected Nodes ({connectedNodes.length})
                </h4>
                <div className="space-y-2">
                  {connectedNodes.map((connNode) => (
                    <button
                      key={connNode.id}
                      onClick={() => {
                        onNodeSelect?.(connNode.id)
                      }}
                      className="w-full text-left p-3 bg-muted/50 hover:bg-primary/20 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                NODE_TYPE_COLORS[connNode.type],
                            }}
                          />
                          <span className="text-xs text-muted-foreground">
                            {NODE_TYPE_LABELS[connNode.type]}
                          </span>
                        </div>
                        <ExternalLink
                          size={14}
                          className="text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {connNode.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
