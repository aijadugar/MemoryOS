'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const lineData = [
  { date: 'Jan 1', memories: 12, interactions: 45 },
  { date: 'Jan 8', memories: 28, interactions: 62 },
  { date: 'Jan 15', memories: 35, interactions: 78 },
  { date: 'Jan 22', memories: 52, interactions: 95 },
  { date: 'Jan 29', memories: 68, interactions: 118 },
  { date: 'Feb 5', memories: 82, interactions: 142 },
  { date: 'Feb 12', memories: 95, interactions: 165 },
]

const barData = [
  { name: 'GitHub', value: 2547 },
  { name: 'Gmail', value: 5843 },
  { name: 'Slack', value: 8932 },
  { name: 'Calendar', value: 342 },
  { name: 'Drive', value: 1256 },
]

const pieData = [
  { name: 'Work', value: 45 },
  { name: 'Personal', value: 30 },
  { name: 'Ideas', value: 15 },
  { name: 'Projects', value: 10 },
]

const areaData = [
  { time: '00:00', queries: 10 },
  { time: '04:00', queries: 15 },
  { time: '08:00', queries: 45 },
  { time: '12:00', queries: 78 },
  { time: '16:00', queries: 92 },
  { time: '20:00', queries: 68 },
  { time: '24:00', queries: 32 },
]

const COLORS = ['#4682b4', '#6a7bcd', '#8b7fbf', '#a88eb3']

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d')

  const kpis = [
    { label: 'Total Memories', value: '12,584', change: '+12.5%', trend: 'up' },
    { label: 'Monthly Syncs', value: '48.2K', change: '+8.3%', trend: 'up' },
    { label: 'Active Integrations', value: '8', change: '+1', trend: 'up' },
    { label: 'Query Responses', value: '2,943', change: '+25.1%', trend: 'up' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground mt-2">Track your MemoryOS activity and insights</p>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d', 'all'].map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange(range)}
              >
                {range === 'all' ? 'All Time' : range.toUpperCase()}
              </Button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {kpis.map((kpi, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{kpi.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{kpi.value}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-green-500">
                  <TrendingUp size={16} />
                  {kpi.change}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Memories & Interactions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="memories" stroke="#4682b4" strokeWidth={2} />
                <Line type="monotone" dataKey="interactions" stroke="#8b7fbf" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Sync by Integration</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                />
                <Bar dataKey="value" fill="#4682b4" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Memory Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Query Volume by Hour</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                />
                <Area type="monotone" dataKey="queries" fill="#4682b4" stroke="#4682b4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
