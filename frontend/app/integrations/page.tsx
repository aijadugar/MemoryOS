'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { integrations as defaultIntegrations } from '@/lib/integration-mock-data'
import { IntegrationCard } from '@/components/integrations/integration-card'
import { Input } from '@/components/ui/input'

type IntegrationStatus = 'all' | 'connected' | 'disconnected' | 'pending' | 'error'

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(defaultIntegrations)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<IntegrationStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const categories = ['all', 'communication', 'productivity', 'development', 'storage']
  const statuses: IntegrationStatus[] = ['all', 'connected', 'disconnected', 'pending', 'error']

  const filteredIntegrations = useMemo(() => {
    return integrations.filter((integration) => {
      const matchesSearch =
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || integration.status === statusFilter

      const matchesCategory = categoryFilter === 'all' || integration.category === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [integrations, searchQuery, statusFilter, categoryFilter])

  const handleConnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === id
          ? {
              ...int,
              status: 'connected' as const,
              lastSync: 'just now',
            }
          : int
      )
    )
  }

  const handleDisconnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === id
          ? {
              ...int,
              status: 'disconnected' as const,
              lastSync: undefined,
            }
          : int
      )
    )
  }

  const stats = {
    total: integrations.length,
    connected: integrations.filter((i) => i.status === 'connected').length,
    synced: integrations.reduce((sum, i) => sum + i.statistics.synced, 0),
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 lg:px-8 py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your favorite tools and services to MemoryOS
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mt-6"
        >
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Connected</div>
            <div className="text-2xl font-bold text-primary">{stats.connected}</div>
            <div className="text-xs text-muted-foreground mt-1">of {stats.total}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Total Synced</div>
            <div className="text-2xl font-bold text-primary">
              {(stats.synced / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-muted-foreground mt-1">items</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Coverage</div>
            <div className="text-2xl font-bold text-primary">
              {Math.round((stats.connected / stats.total) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">enabled</div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="border-b border-border px-4 lg:px-8 py-4 lg:py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
          <div className="flex gap-2 flex-shrink-0">
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2">Status:</div>
              <div className="flex gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      statusFilter === status
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
          <div className="flex gap-2 flex-shrink-0">
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2">Category:</div>
              <div className="flex gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      categoryFilter === category
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {category === 'all'
                      ? 'All Categories'
                      : category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 lg:py-8">
        {filteredIntegrations.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredIntegrations.map((integration, index) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <IntegrationCard
                  integration={integration}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center h-64 text-center"
          >
            <div>
              <p className="text-lg font-semibold text-foreground mb-2">No integrations found</p>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
