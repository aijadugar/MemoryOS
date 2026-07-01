'use client'

import { config } from '@/lib/config'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/theme-provider'
import { Sun, Moon, Monitor, Copy, Check, Bell, Lock, Brain, Mic, AlertTriangle, Download, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useWorkspace } from '@/hooks/useWorkspace'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
}

type SettingsState = {
  emailNotifications: boolean
  slackNotifications: boolean
  soundAlerts: boolean
  memoryAutoSave: boolean
  dailySummaries: boolean
  voiceEnabled: boolean
  voiceAutoplay: boolean
  twoFactor: boolean
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const { workspace, summary } = useWorkspace()
  const workspaceData = workspace.data?.data
  const workspaceSummary = summary.data?.data
  const [copied, setCopied] = useState<string | null>(null)
  const [settings, setSettings] = useState<SettingsState>({
    emailNotifications: true,
    slackNotifications: false,
    soundAlerts: true,
    memoryAutoSave: true,
    dailySummaries: true,
    voiceEnabled: true,
    voiceAutoplay: false,
    twoFactor: true,
  })

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const toggleSetting = (key: keyof SettingsState) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-3xl"
    >
      {/* Header */}
      <motion.section variants={itemVariants}>
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Customize your {config.appName} experience
          </p>
        </div>
      </motion.section>

      {/* 1. General Settings */}
      <motion.section variants={itemVariants}>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sun size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">General</h2>
              <p className="text-sm text-muted-foreground">Basic application settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Theme</p>
              <div className="flex gap-3">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'system', icon: Monitor, label: 'System' },
                ].map(({ value, icon: Icon, label }) => (
                  <motion.button
                    key={value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleTheme(value as 'light' | 'dark' | 'system')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      theme === value
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. Workspace Settings */}
      <motion.section variants={itemVariants}>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Download size={20} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Workspace</h2>
              <p className="text-sm text-muted-foreground">Workspace settings and members</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Workspace Name</label>
              <input
                type="text"
                value={workspaceData?.name || workspaceSummary?.workspace_name || 'MemoryOS Workspace'}
                readOnly
                className="w-full mt-2 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Members</label>
              <input
                type="text"
                value={`${workspaceData?.members_count ?? workspaceSummary?.members ?? 0} members`}
                disabled
                className="w-full mt-2 px-3 py-2 bg-muted border border-border rounded-lg opacity-60 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* 3. Notifications Settings */}
      <motion.section variants={itemVariants}>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Bell size={20} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground">Manage how you receive updates</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'slackNotifications', label: 'Slack Notifications', desc: 'Send updates to your Slack workspace' },
              { key: 'soundAlerts', label: 'Sound Alerts', desc: 'Play sound for important events' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggleSetting(item.key as keyof SettingsState)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    settings[item.key as keyof typeof settings]
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {settings[item.key as keyof typeof settings] ? 'On' : 'Off'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 4. Privacy Settings */}
      <motion.section variants={itemVariants}>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Lock size={20} className="text-purple-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Privacy</h2>
              <p className="text-sm text-muted-foreground">Control your data and privacy</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer p-4 bg-muted/30 rounded-lg">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded"
              />
              <div>
                <p className="font-medium text-foreground text-sm">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add extra security to your account</p>
              </div>
            </label>
          </div>
        </div>
      </motion.section>

      {/* 5. Memory Settings */}
      <motion.section variants={itemVariants}>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Brain size={20} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Memory</h2>
              <p className="text-sm text-muted-foreground">Configure memory behavior</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key: 'memoryAutoSave', label: 'Auto-Save Memories', desc: 'Automatically save interactions' },
              { key: 'dailySummaries', label: 'Daily Summaries', desc: 'Get daily memory summaries' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggleSetting(item.key as keyof SettingsState)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    settings[item.key as keyof typeof settings]
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {settings[item.key as keyof typeof settings] ? 'On' : 'Off'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 6. Voice Settings */}
      <motion.section variants={itemVariants}>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Mic size={20} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Voice</h2>
              <p className="text-sm text-muted-foreground">Voice assistant settings</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key: 'voiceEnabled', label: 'Enable Voice Assistant', desc: 'Use voice commands' },
              { key: 'voiceAutoplay', label: 'Autoplay Responses', desc: 'Automatically play voice responses' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggleSetting(item.key as keyof SettingsState)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    settings[item.key as keyof typeof settings]
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {settings[item.key as keyof typeof settings] ? 'On' : 'Off'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 7. Integrations Settings */}
      <motion.section variants={itemVariants}>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Copy size={20} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Integrations</h2>
              <p className="text-sm text-muted-foreground">Connected services and API keys</p>
            </div>
          </div>

          <div className="space-y-4">
            {config.supabaseUrl && (
              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">Supabase URL</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(config.supabaseUrl, 'supabase-url')}
                    className="gap-1"
                  >
                    {copied === 'supabase-url' ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground font-mono break-all">{config.supabaseUrl}</p>
              </div>
            )}

            {config.backendUrl && (
              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">Backend URL</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(config.backendUrl, 'backend-url')}
                    className="gap-1"
                  >
                    {copied === 'backend-url' ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground font-mono break-all">{config.backendUrl}</p>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* 8. Danger Zone */}
      <motion.section variants={itemVariants}>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <AlertTriangle size={20} className="text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
              <p className="text-sm text-muted-foreground">Permanent actions - use with caution</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg">
              <div>
                <p className="font-medium text-foreground text-sm">Delete All Memories</p>
                <p className="text-xs text-muted-foreground">This action cannot be undone</p>
              </div>
              <Button variant="outline" className="text-destructive hover:bg-destructive/10">
                Delete
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg">
              <div>
                <p className="font-medium text-foreground text-sm">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button className="bg-destructive hover:bg-destructive/90 text-white">
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Save Button */}
      <motion.div variants={itemVariants} className="flex justify-end gap-3 pt-4">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
      </motion.div>
    </motion.div>
  )
}
