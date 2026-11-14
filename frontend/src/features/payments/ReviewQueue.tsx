import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatKES, formatDate } from '@/lib/utils'
import { AlertOctagon, CheckCircle2, XCircle } from 'lucide-react'

interface FlaggedPayment {
  id: string
  reference: string
  provider: string
  amount_received: number
  expected_amount: number
  reason: 'wrong_amount' | 'duplicate_callback' | 'overpayment' | 'account_mismatch'
  received_at: string
  customer_phone: string
}

export const ReviewQueue: React.FC = () => {
  const [items, setItems] = useState<FlaggedPayment[]>([
    {
      id: 'rev-01',
      reference: 'QHL99321KK',
      provider: 'MpesaStkGateway',
      amount_received: 1200,
      expected_amount: 1000,
      reason: 'overpayment',
      received_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      customer_phone: '0712334455',
    },
    {
      id: 'rev-02',
      reference: 'QHL99882AA',
      provider: 'MpesaManualGateway',
      amount_received: 50,
      expected_amount: 500,
      reason: 'wrong_amount',
      received_at: new Date(Date.now() - 3600000 * 7).toISOString(),
      customer_phone: '0722001122',
    },
  ])

  const handleResolve = (id: string, action: 'accept' | 'reject') => {
    setItems((prev) => prev.filter((it) => it.id !== id))
    alert(`Payment ${id} has been marked as ${action === 'accept' ? 'ACCEPTED' : 'REJECTED & REFUNDED'}.`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-amber-600" />
          Manager Payment Review Queue
        </CardTitle>
        <CardDescription>
          Incoming callbacks or manual entries with amount discrepancies, requiring manual manager review
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400">
            All pending payment discrepancies are resolved. Review queue is clear.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 font-mono">{item.reference}</span>
                    <Badge variant="warning">{item.reason.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Received: {formatDate(item.received_at)} • Payer Phone: {item.customer_phone}
                  </p>
                  <p className="text-xs text-gray-700 mt-1">
                    Received: <strong className="text-gray-900">{formatKES(item.amount_received)}</strong> (Expected: {formatKES(item.expected_amount)})
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolve(item.id, 'reject')}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject & Return
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleResolve(item.id, 'accept')}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accept As Credit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
