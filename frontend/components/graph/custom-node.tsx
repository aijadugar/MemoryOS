'use client'

import { Handle, Position, NodeProps } from 'reactflow'
import { NODE_TYPE_COLORS } from '@/lib/graph-types'

export function CustomNode({
  data,
  selected,
}: NodeProps<{
  label: string
  type: string
  selected?: boolean
}>) {
  const color = NODE_TYPE_COLORS[data.type as keyof typeof NODE_TYPE_COLORS] || '#6B7280'

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 transition-all ${
        selected
          ? 'border-primary shadow-lg scale-110 bg-white dark:bg-slate-900'
          : 'border-transparent hover:border-primary/50 bg-white dark:bg-slate-800'
      }`}
      style={{
        boxShadow: selected ? `0 0 20px ${color}` : 'none',
        borderColor: selected ? color : 'transparent',
      }}
    >
      <div className="w-24 text-center">
        <div
          className="w-2 h-2 rounded-full mb-2 mx-auto"
          style={{ backgroundColor: color }}
        />
        <p className="text-xs font-semibold text-foreground truncate">{data.label}</p>
        <p className="text-xs text-muted-foreground mt-1">{data.type}</p>
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
