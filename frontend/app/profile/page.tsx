'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, LogOut, Lock, Smartphone, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useIntegrations } from '@/hooks/useIntegrations'
import type { Integration } from '@/lib/integration-types'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const { me, workspace, summary } = useWorkspace()
  const { integrations } = useIntegrations()
  const user = me.data?.data
  const workspaceData = workspace.data?.data
  const workspaceSummary = summary.data?.data
  const connectedAccounts: Integration[] = (integrations.data || []).filter((integration: Integration) => integration.status === 'connected')

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'security', label: 'Security' },
    { id: 'api', label: 'API Usage' },
  ]

  const sessions = [
    {
      id: 1,
      device: 'MacBook Pro',
      browser: 'Chrome',
      location: 'San Francisco, CA',
      lastActive: '2 minutes ago',
      current: true,
    },
    { id: 2, device: 'iPhone 15', browser: 'Safari', location: 'San Francisco, CA', lastActive: '1 hour ago' },
    { id: 3, device: 'Windows PC', browser: 'Chrome', location: 'Home', lastActive: '3 days ago' },
  ]

  const apiUsage = [
    { endpoint: '/api/v1/workspace', calls: String(workspaceSummary?.members ?? 0), limit: 'members', percentUsed: 0 },
    { endpoint: '/api/v1/dashboard', calls: String(workspaceSummary?.total_memories ?? 0), limit: 'memories', percentUsed: 0 },
    { endpoint: '/api/v1/documents', calls: String(workspaceSummary?.total_documents ?? 0), limit: 'documents', percentUsed: 0 },
    { endpoint: '/api/v1/integrations', calls: String(workspaceSummary?.total_integrations ?? 0), limit: 'integrations', percentUsed: 0 },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{(user?.display_name || user?.email || 'ME').slice(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{user?.display_name || 'MemoryOS User'}</h1>
              <p className="text-muted-foreground">{user?.email || 'Signed in with Supabase'}</p>
              <p className="text-sm text-muted-foreground mt-1">{workspaceData?.current_plan || 'Current'} Plan</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="border-b border-border mb-6">
            <div className="flex gap-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-4">Usage Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Storage Used</span>
                        <span className="text-sm font-medium text-foreground">{workspaceSummary?.total_documents ?? 0} documents</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-[48%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">API Calls</span>
                        <span className="text-sm font-medium text-foreground">{workspaceSummary?.total_chats ?? 0} chats</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full w-[19%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-4">Plan Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Plan</span>
                      <span className="font-medium text-foreground">{workspaceData?.current_plan || 'Current'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Billing</span>
                      <span className="font-medium text-foreground">{workspaceData?.created_at ? new Date(workspaceData.created_at).toLocaleDateString() : 'Not available'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Integrations</span>
                      <span className="font-medium text-foreground">{workspaceSummary?.total_integrations ?? 0}</span>
                    </div>
                    <div className="pt-4">
                      <Button className="w-full" variant="outline">
                        Manage Subscription
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Connected Accounts</h3>
                <div className="space-y-3">
                  {connectedAccounts.map((account: Integration) => (
                    <div key={account.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium text-foreground">{account.name}</span>
                      <Button size="sm" variant="ghost">
                        Disconnect
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Workspace Info</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Workspace Name</label>
                    <p className="font-medium text-foreground">{workspaceData?.name || workspaceSummary?.workspace_name || 'MemoryOS Workspace'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Members</label>
                    <p className="font-medium text-foreground">{workspaceData?.members_count ?? workspaceSummary?.members ?? 0} members</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground mb-4">Active Sessions</h3>
              {sessions.map((session) => (
                <div key={session.id} className="bg-card border border-border rounded-lg p-6 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <Smartphone size={18} className="text-muted-foreground" />
                      <span className="font-medium text-foreground">{session.device}</span>
                      {session.current && <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">Current</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {session.browser} • {session.location}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Last active: {session.lastActive}</p>
                  </div>
                  {!session.current && <Button size="sm" variant="ghost" className="text-destructive">Sign out</Button>}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock size={20} className="text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Enabled</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Manage
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock size={20} className="text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">Password</p>
                        <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Change
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-foreground mb-4">API Key</h3>
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <code className="text-sm font-mono text-foreground flex-1">sk-proj-••••••••••••••••••••</code>
                  <Button size="sm" variant="ghost">
                    <Copy size={18} />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-4">Usage by Endpoint</h3>
                <div className="space-y-4">
                  {apiUsage.map((usage, i) => (
                    <div key={i} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-foreground text-sm">{usage.endpoint}</span>
                        <span className="text-sm text-muted-foreground">
                          {usage.calls} / {usage.limit}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${usage.percentUsed}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
