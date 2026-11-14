import React, { useState, useEffect } from 'react'
import { dayCloseApi } from '@/api/dayclose'
import type { DayCloseSession, PaymentMethodCode } from '@/types'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatKES, formatDate } from '@/lib/utils'
import {
  Calculator,
  Lock,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Smartphone,
  CreditCard,
  Building,
} from 'lucide-react'

export const DayClosePage: React.FC = () => {
  const { hasRole } = useAuth()
  const [session, setSession] = useState<DayCloseSession | null>(null)
  const [counted, setCounted] = useState<Record<PaymentMethodCode, number>>({
    cash: 0,
    mpesa_manual: 0,
    mpesa_stk: 0,
    card: 0,
    airtel: 0,
    bank: 0,
    credit: 0,
  })
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    dayCloseApi.getStatus().then((data) => {
      setSession(data)
      if (data.status === 'open') {
        // Pre-fill counted with expected as a starting convenience
        setCounted(data.expected_totals)
      } else {
        setCounted(data.counted_totals)
        setNotes(data.notes || '')
      }
    })
  }, [])

  if (!session) {
    return <div className="p-8 text-center text-xs text-gray-500">Loading day close session...</div>
  }

  const isClosed = session.status === 'closed'

  const methodLabels: Record<PaymentMethodCode, { label: string; icon: any }> = {
    cash: { label: 'Physical Cash in Drawer', icon: Banknote },
    mpesa_manual: { label: 'M-Pesa Till (Manual Entries)', icon: Smartphone },
    mpesa_stk: { label: 'M-Pesa STK Push (Express)', icon: Smartphone },
    card: { label: 'Card Terminal POS', icon: CreditCard },
    credit: { label: 'Customer Account Credit', icon: Building },
    airtel: { label: 'Airtel Money', icon: Smartphone },
    bank: { label: 'Bank Transfers', icon: Building },
  }

  const relevantMethods: PaymentMethodCode[] = ['cash', 'mpesa_manual', 'mpesa_stk']

  const totalExpected = relevantMethods.reduce((acc, m) => acc + (session.expected_totals[m] || 0), 0)
  const totalCounted = relevantMethods.reduce((acc, m) => acc + (counted[m] || 0), 0)
  const totalVariance = totalCounted - totalExpected

  const handleCloseDay = async () => {
    setIsSubmitting(true)
    try {
      const updated = await dayCloseApi.closeDay(counted, notes)
      setSession(updated)
      setShowConfirm(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">End of Day Close & Reconciliation</h1>
              <Badge variant={isClosed ? 'danger' : 'success'}>
                {isClosed ? 'Day Closed' : 'Day Open'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Date: <strong>{session.date}</strong> • Branch #01 • Opened: {formatDate(session.opened_at)}
              {session.closed_at && ` • Closed: ${formatDate(session.closed_at)} by ${session.closed_by}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!hasRole('owner', 'manager') && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                Staff Review Only (Manager sign-off required)
              </span>
            )}
          </div>
        </div>

        {/* Top Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-white">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
              Expected Succeeded Payments
            </span>
            <span className="text-xl font-extrabold text-gray-900 mt-1 block">
              {formatKES(totalExpected)}
            </span>
            <span className="text-[11px] text-gray-500">Calculated from POS transactions</span>
          </Card>

          <Card className="p-4 bg-white">
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
              Physically Counted Total
            </span>
            <span className="text-xl font-extrabold text-blue-700 mt-1 block">
              {formatKES(totalCounted)}
            </span>
            <span className="text-[11px] text-gray-500">Entered by teller/manager</span>
          </Card>

          <Card className="p-4 bg-white">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
              Net Variance
            </span>
            <span
              className={`text-xl font-extrabold mt-1 block ${
                totalVariance === 0
                  ? 'text-green-600'
                  : totalVariance > 0
                  ? 'text-sky-600'
                  : 'text-rose-600'
              }`}
            >
              {totalVariance > 0 ? `+${formatKES(totalVariance)} (Surplus)` : totalVariance < 0 ? `${formatKES(totalVariance)} (Deficit)` : 'Balanced (KES 0.00)'}
            </span>
            <span className="text-[11px] text-gray-500">
              {totalVariance === 0 ? 'Exact match' : 'Requires explanation in closing notes'}
            </span>
          </Card>
        </div>

        {/* Breakdown table and inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              Gateway-by-Gateway Reconciliation
            </CardTitle>
            <CardDescription>
              Verify Cash against drawer and M-Pesa against Safaricom statement summary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-y border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Payment Method</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Expected (POS)</th>
                    <th className="px-4 py-2.5 font-semibold text-right w-48">Counted / Statement</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {relevantMethods.map((method) => {
                    const expectedAmt = session.expected_totals[method] || 0
                    const countedAmt = counted[method] || 0
                    const variance = countedAmt - expectedAmt
                    const { label, icon: Icon } = methodLabels[method]

                    return (
                      <tr key={method} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-gray-900">{label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-700">
                          {formatKES(expectedAmt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isClosed ? (
                            <span className="font-bold text-gray-900">{formatKES(countedAmt)}</span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              value={countedAmt}
                              onChange={(e) =>
                                setCounted({ ...counted, [method]: Number(e.target.value) })
                              }
                              className="w-32 ml-auto text-right py-1 px-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 font-mono"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold">
                          <span
                            className={
                              variance === 0
                                ? 'text-gray-500'
                                : variance > 0
                                ? 'text-sky-600'
                                : 'text-rose-600'
                            }
                          >
                            {variance === 0 ? '-' : formatKES(variance)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Closing Notes */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Closing Manager Notes & Variance Explanations
              </label>
              <textarea
                rows={3}
                disabled={isClosed}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention any drawer shortages, customer credit agreements or unresolved M-Pesa reversals..."
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Close Day Action */}
            {!isClosed && (
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-amber-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    Closing the day locks transactions for this business cycle and snapshots variances.
                  </span>
                </div>

                <Button
                  variant="danger"
                  onClick={() => setShowConfirm(true)}
                  disabled={!hasRole('owner', 'manager')}
                >
                  <Lock className="h-4 w-4 mr-1.5" /> Close Day & Lock Terminal
                </Button>
              </div>
            )}

            {isClosed && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                <div className="text-xs text-green-800">
                  <strong className="font-bold">This day has been officially closed and audited.</strong>
                  <p className="mt-0.5">
                    Closed on {formatDate(session.closed_at)} by {session.closed_by}.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-gray-900">Confirm End of Day Close</h3>
              <p className="text-xs text-gray-600">
                Are you sure you want to finalize today's close? Total expected is{' '}
                <strong>{formatKES(totalExpected)}</strong> and physically counted is{' '}
                <strong>{formatKES(totalCounted)}</strong> (Variance: {formatKES(totalVariance)}).
              </p>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={isSubmitting}
                  onClick={handleCloseDay}
                >
                  Yes, Close & Lock
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
