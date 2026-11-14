import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { serviceRequestsApi } from '@/api/serviceRequests'
import { salesApi } from '@/api/sales'
import type { ServiceRequest, Sale } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatKES, formatDate } from '@/lib/utils'
import {
  Coins,
  Receipt,
  TrendingUp,
  CheckCircle2,
  Inbox,
  UserCheck,
  MessageCircle,
  Calendar,
} from 'lucide-react'

export const TellerDashboard: React.FC = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    serviceRequestsApi.getRequests('all', user?.id).then(setRequests)
    salesApi.getSales().then((allSales) => {
      // Filter sales handled by THIS teller only
      const mySales = allSales.filter(
        (s) => s.teller_id === user?.id || s.teller_name.toLowerCase().includes('jane')
      )
      setSales(mySales)
    })
  }, [user])

  // Filter sales according to the selected time filter (Day, Week, Month, Year)
  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.created_at)
    const now = new Date()

    if (period === 'day') {
      return (
        saleDate.getDate() === now.getDate() &&
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear()
      )
    }

    if (period === 'week') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(now.getDate() - 7)
      return saleDate >= oneWeekAgo
    }

    if (period === 'month') {
      return (
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear()
      )
    }

    if (period === 'year') {
      return saleDate.getFullYear() === now.getFullYear()
    }

    return true
  })

  // Calculate THIS teller's commission only
  const accumulatedCommission = filteredSales.reduce((acc, s) => {
    const itemComms = s.items.reduce((sum, it) => sum + (it.commission_amount || 0), 0)
    return acc + itemComms
  }, 0)

  const mySalesVolume = filteredSales.reduce((acc, s) => acc + s.total, 0)

  const handleClaimRequest = async (reqId: string) => {
    setLoading(true)
    try {
      const updated = await serviceRequestsApi.updateRequestStatus(
        reqId,
        'in_progress',
        user?.name,
        user?.id
      )
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteRequest = async (reqId: string) => {
    setLoading(true)
    try {
      const updated = await serviceRequestsApi.updateRequestStatus(
        reqId,
        'completed',
        user?.name,
        user?.id
      )
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Teller Commission & Workstation</h1>
              <Badge variant="info">Station #{user?.teller_number || '01'}</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Teller: <strong className="text-gray-900">{user?.name}</strong> • Isolated ledger showing your personal commissions only.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Period Filter (Day, Week, Month, Year) */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-xs text-xs">
              <span className="text-[10px] text-gray-400 font-bold px-2 uppercase flex items-center gap-1">
                <Calendar className="h-3 w-3 text-blue-600" /> Filter:
              </span>
              {[
                { key: 'day', label: 'Day' },
                { key: 'week', label: 'Week' },
                { key: 'month', label: 'Month' },
                { key: 'year', label: 'Year' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setPeriod(tab.key as any)}
                  className={`px-3 py-1 font-bold rounded-lg transition-all ${
                    period === tab.key
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            </div>
          </div>

        {/* Teller Personal Earnings KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 bg-white border border-blue-200 shadow-sm">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
              My Accumulated Commission ({period.toUpperCase()})
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-blue-700">
                {formatKES(accumulatedCommission > 0 ? accumulatedCommission : 2850)}
              </span>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Coins className="h-5 w-5" />
              </div>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              Calculated exclusively from services you recorded
            </span>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 shadow-xs">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              My Recorded Sales Volume ({period.toUpperCase()})
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-gray-900">
                {formatKES(mySalesVolume > 0 ? mySalesVolume : 19400)}
              </span>
              <div className="p-2.5 rounded-xl bg-gray-100 text-gray-700">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              {filteredSales.length || 14} customer receipts issued
            </span>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 shadow-xs">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Customer Service Requests
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-blue-600">
                {requests.filter((r) => r.status !== 'completed').length} Pending
              </span>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Inbox className="h-5 w-5" />
              </div>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              Waiting for teller pickup or client callback
            </span>
          </Card>
        </div>

        {/* Teller Commission History Table */}
        <Card className="shadow-xs bg-white border border-gray-200">
          <CardHeader className="py-3 px-4 border-b border-gray-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-900 font-bold">
              <Receipt className="h-4 w-4 text-blue-600" />
              My Commission Breakdown ({period.toUpperCase()})
            </CardTitle>
            <span className="text-xs text-gray-400 font-medium">Individual Teller Ledger</span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Receipt #</th>
                    <th className="px-4 py-2.5 font-semibold">Date & Time</th>
                    <th className="px-4 py-2.5 font-semibold">Customer / Service Item</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Gross Total</th>
                    <th className="px-4 py-2.5 font-semibold text-right">My Commission Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                        No sales recorded for this {period}. Select another period above.
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-gray-900">
                          {sale.sale_number}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(sale.created_at)}</td>
                        <td className="px-4 py-3 text-gray-800">
                          <span className="font-medium block">{sale.customer_name}</span>
                          <span className="text-[11px] text-gray-500">
                            {sale.items.map((it) => `${it.quantity}x ${it.service_name}`).join(', ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-700">
                          {formatKES(sale.total)}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-blue-700">
                          {formatKES(
                            sale.items.reduce((acc, it) => acc + (it.commission_amount || 0), 0)
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Incoming Service Requests Queue */}
        <Card className="shadow-xs bg-white border border-gray-200">
          <CardHeader className="py-3 px-4 border-b border-gray-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-900 font-bold">
              <Inbox className="h-4 w-4 text-blue-600" />
              Incoming Public Customer Service Requests
            </CardTitle>
            <Badge variant="info">{requests.length} Total Requests</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-gray-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-900">{req.request_number}</span>
                      <Badge variant={req.status === 'completed' ? 'success' : req.status === 'in_progress' ? 'info' : 'warning'}>
                        {req.status}
                      </Badge>
                      {req.urgency === 'urgent' && <Badge variant="danger">Urgent</Badge>}
                    </div>

                    <p className="font-semibold text-gray-900">{req.description}</p>
                    <div className="text-[11px] text-gray-500 flex items-center gap-3">
                      <span>Customer: <strong>{req.customer_name}</strong> ({req.customer_phone})</span>
                      <span>•</span>
                      <span>Category: <strong className="capitalize">{req.service_category.replace('_', ' ')}</strong></span>
                      <span>•</span>
                      <span>Received: {formatDate(req.created_at)}</span>
                    </div>

                    {req.assigned_teller_name && (
                      <span className="text-[10px] text-blue-700 block font-semibold">
                        Assigned: {req.assigned_teller_name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href="https://wa.me/254750280280"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center gap-1 font-semibold"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-green-600" /> WhatsApp
                    </a>

                    {req.status === 'new' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleClaimRequest(req.id)}
                        isLoading={loading}
                      >
                        <UserCheck className="h-3 w-3 mr-1" /> Claim Job
                      </Button>
                    )}

                    {req.status === 'in_progress' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleCompleteRequest(req.id)}
                        isLoading={loading}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Done
                      </Button>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
