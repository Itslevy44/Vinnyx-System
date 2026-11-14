import React, { useState, useEffect } from 'react'
import { auditApi } from '@/api/audit'
import type { AuditLogEntry } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { ShieldCheck, Search, Filter } from 'lucide-react'

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [search, setSearch] = useState('')
  const [eventFilter, setEventFilter] = useState('all')

  useEffect(() => {
    auditApi.getLogs().then(setLogs)
  }, [])

  const filteredLogs = logs.filter((l) => {
    const matchesFilter = eventFilter === 'all' || l.event.startsWith(eventFilter)
    const matchesSearch =
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.user_name.toLowerCase().includes(search.toLowerCase()) ||
      l.ip_address.includes(search)
    return matchesFilter && matchesSearch
  })

  const getEventBadge = (event: string) => {
    if (event.includes('login') || event.includes('auth')) {
      return <Badge variant="info">Auth</Badge>
    }
    if (event.includes('void') || event.includes('failed')) {
      return <Badge variant="danger">Security Alert</Badge>
    }
    if (event.includes('provider') || event.includes('gateway')) {
      return <Badge variant="warning">Config Change</Badge>
    }
    if (event.includes('approved') || event.includes('completed')) {
      return <Badge variant="success">Admin Action</Badge>
    }
    return <Badge variant="neutral">System</Badge>
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
              <span>Cross-Cutting Audit Trail & Event Logs</span>
            </h1>
            <p className="text-xs text-gray-500">
              Immutable audit log capturing authentication attempts, provider toggles, voided sales, and approvals.
            </p>
          </div>

          <Badge variant="neutral">{logs.length} Audited Events</Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by keyword, user, or IP address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Event Domains</option>
              <option value="auth">Authentication</option>
              <option value="payment">Payment & Gateways</option>
              <option value="sale">Sales & Voids</option>
              <option value="payroll">Payroll & Approvals</option>
              <option value="day_close">Day Close</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <Card className="shadow-xs">
          <CardHeader className="py-3 px-4 border-b border-gray-100">
            <CardTitle className="text-sm">Logged Security & Transaction Events</CardTitle>
            <CardDescription>Generated automatically by module domain events</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Timestamp</th>
                    <th className="px-4 py-2.5 font-semibold">Domain</th>
                    <th className="px-4 py-2.5 font-semibold">Event Name</th>
                    <th className="px-4 py-2.5 font-semibold">Actor / Role</th>
                    <th className="px-4 py-2.5 font-semibold">IP Address</th>
                    <th className="px-4 py-2.5 font-semibold">Event Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3">{getEventBadge(log.event)}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-gray-800">
                        {log.event}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-gray-900 block">{log.user_name}</span>
                        <span className="text-[10px] text-gray-400 uppercase">{log.user_role}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-500">{log.ip_address}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-md">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
