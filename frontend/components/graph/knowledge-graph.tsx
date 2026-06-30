'use client'

import React, { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { GraphNode as GraphNodeType, GraphEdge as GraphEdgeType } from '@/lib/graph-types'
import { NODE_TYPE_COLORS, NodeType } from '@/lib/graph-types'
import { CustomNode } from './custom-node'
import { GraphControls } from './graph-controls'

interface KnowledgeGraphProps {
  data: {
    nodes: GraphNodeType[]
    edges: GraphEdgeType[]
  }
  selectedNodeId?: string
  onNodeSelect?: (nodeId: string) => void
  searchQuery?: string
  activeFilters?: string[]
  hideControls?: boolean
  hideMinimap?: boolean
}

const nodeTypes = {
  custom: CustomNode,
}

export function KnowledgeGraph({
  data,
  selectedNodeId,
  onNodeSelect,
  searchQuery = '',
  activeFilters = [],
  hideControls = false,
  hideMinimap = false,
}: KnowledgeGraphProps) {
  const [searchTerm, setSearchTerm] = useState(searchQuery)

  // Convert graph data to React Flow format
  const initialNodes: Node[] = data.nodes
    .filter((node) => activeFilters.length === 0 || activeFilters.includes(node.type))
    .map((node: any) => {
      const isSearchMatch =
        !searchTerm ||
        node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.id.toLowerCase().includes(searchTerm.toLowerCase())

      const color = NODE_TYPE_COLORS[node.type as NodeType]

      return {
        id: node.id,
        data: {
          label: node.label,
          type: node.type,
          selected: selectedNodeId === node.id,
        },
        position: node.position || { x: 0, y: 0 },
        type: 'custom',
        selected: selectedNodeId === node.id,
        style: {
          opacity: isSearchMatch ? 1 : 0.3,
          filter: isSearchMatch ? 'none' : 'grayscale(100%)',
        },
      }
    })

  const initialEdges: Edge[] = data.edges.map((edge) => {
    const sourceNode = data.nodes.find((n) => n.id === edge.source)
    const targetNode = data.nodes.find((n) => n.id === edge.target)

    const isVisible =
      sourceNode &&
      targetNode &&
      (activeFilters.length === 0 ||
        (activeFilters.includes(sourceNode.type) &&
          activeFilters.includes(targetNode.type)))

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: selectedNodeId === edge.source || selectedNodeId === edge.target,
      style: {
        stroke: '#94A3B8',
        strokeWidth: 2,
        opacity: isVisible ? 0.5 : 0.1,
      },
    }
  })

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [data, searchTerm, activeFilters, selectedNodeId, setEdges, setNodes])

  // Update nodes when selection or search changes
  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
        data: {
          ...node.data,
          selected: node.id === selectedNodeId,
        },
      }))
    )
  }, [selectedNodeId, setNodes])

  // Handle node click
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeSelect?.(node.id)
    },
    [onNodeSelect]
  )

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Background />
        {!hideControls && (
          <GraphControls searchQuery={searchTerm} onSearchChange={setSearchTerm} />
        )}
        {!hideMinimap && (
          <MiniMap
            style={{
              backgroundColor: 'var(--card)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
            }}
            nodeColor={(node) => {
              const graphNode = data.nodes.find((n) => n.id === node.id)
              if (!graphNode) return '#6B7280'
              return NODE_TYPE_COLORS[graphNode.type]
            }}
          />
        )}
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </div>
  )
}
