'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, LogOut, Lock, Smartphone, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview')

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
    { endpoint: '/api/memories', calls: '2,543', limit: '10,000', percentUsed: 25 },
    { endpoint: '/api/search', calls: '1,842', limit: '5,000', percentUsed: 37 },
    { endpoint: '/api/integrations', calls: '342', limit: '2,000', percentUsed: 17 },
    { endpoint: '/api/chat', calls: '5,124', limit: '15,000', percentUsed: 34 },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
              <span className="text-3xl font-bold text-white">AS</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Alex Smith</h1>
              <p className="text-muted-foreground">alex@memoryo.com</p>
              <p className="text-sm text-muted-foreground mt-1">Pro Plan • Member since Jan 2024</p>
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
                        <span className="text-sm font-medium text-foreground">2.4 GB / 5 GB</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-[48%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">API Calls</span>
                        <span className="text-sm font-medium text-foreground">9,851 / 50,000</span>
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
                      <span className="font-medium text-foreground">Pro Annual</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Billing</span>
                      <span className="font-medium text-foreground">Jan 15, 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Integrations</span>
                      <span className="font-medium text-foreground">8 / Unlimited</span>
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
                  {['GitHub', 'Gmail', 'Slack', 'Google Drive'].map((account) => (
                    <div key={account} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium text-foreground">{account}</span>
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
                    <p className="font-medium text-foreground">MemoryOS Workspace</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Members</label>
                    <p className="font-medium text-foreground">3 members</p>
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
