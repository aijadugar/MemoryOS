import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import { Integration } from '@/lib/integration-types'
import { Button } from '@/components/ui/button'

interface IntegrationCardProps {
  integration: Integration
  onConnect?: (id: string) => void
  onDisconnect?: (id: string) => void
}

export function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
}: IntegrationCardProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const statusStyles = {
    connected: 'bg-green-500/10 text-green-600 border-green-500/20',
    disconnected: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-600 border-red-500/20',
  }

  const statusLabels = {
    connected: 'Connected',
    disconnected: 'Disconnected',
    pending: 'Pending',
    error: 'Error',
  }

  const IconComponent = (LucideIcons as any)[integration.logo] || LucideIcons.Zap

  const handleConnect = async () => {
    setIsConnecting(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    onConnect?.(integration.id)
    setIsConnecting(false)
  }

  const handleDisconnect = async () => {
    setIsConnecting(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    onDisconnect?.(integration.id)
    setIsConnecting(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative bg-card border border-border rounded-lg p-6 h-full flex flex-col overflow-hidden transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg">
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: `${integration.color}20`,
                  color: integration.color,
                }}
              >
                <IconComponent size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{integration.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {integration.category.charAt(0).toUpperCase() + integration.category.slice(1)}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div
              className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[integration.status]} transition-all duration-300`}
            >
              {statusLabels[integration.status]}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 group-hover:text-foreground/80 transition-colors">
            {integration.description}
          </p>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Synced</div>
              <div className="text-sm font-semibold text-foreground">
                {integration.statistics.synced.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Updated</div>
              <div className="text-sm font-semibold text-foreground">
                {integration.statistics.updated.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Errors</div>
              <div className={`text-sm font-semibold ${integration.statistics.errors ? 'text-red-600' : 'text-foreground'}`}>
                {integration.statistics.errors || '0'}
              </div>
            </div>
          </div>

          {/* Last Sync */}
          {integration.lastSync && integration.status === 'connected' && (
            <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Last synced {integration.lastSync}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-auto pt-2">
            {integration.status === 'disconnected' ? (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex-1"
                size="sm"
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            ) : integration.status === 'connected' ? (
              <>
                <Button
                  onClick={handleDisconnect}
                  disabled={isConnecting}
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                >
                  {isConnecting ? 'Disconnecting...' : 'Disconnect'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Configure
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={isConnecting || integration.status === 'error'}
                className="flex-1"
                size="sm"
              >
                {integration.status === 'error'
                  ? 'Reconnect'
                  : isConnecting
                    ? 'Completing...'
                    : 'Complete Setup'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
