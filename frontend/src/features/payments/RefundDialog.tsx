import React, { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { paymentsApi } from '@/api/payments'
import { formatKES } from '@/lib/utils'
import type { Payment } from '@/types'
import { RotateCcw, AlertTriangle } from 'lucide-react'

interface RefundDialogProps {
  isOpen: boolean
  onClose: () => void
  payment: Payment | null
  onRefundSuccess: () => void
}

export const RefundDialog: React.FC<RefundDialogProps> = ({
  isOpen,
  onClose,
  payment,
  onRefundSuccess,
}) => {
  const [amount, setAmount] = useState<number>(payment?.amount || 0)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  React.useEffect(() => {
    if (payment) {
      setAmount(payment.amount)
    }
  }, [payment])

  if (!payment) return null

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault()
    if (amount <= 0 || amount > payment.amount) {
      setError(`Amount must be between 1 and ${formatKES(payment.amount)}`)
      return
    }

    if (!reason.trim()) {
      setError('Please provide a reason for the refund')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      await paymentsApi.refund(payment.uuid, amount, reason.trim())
      onRefundSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Refund failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Process Payment Refund"
      description={`Refund for ${payment.method_code.toUpperCase()} transaction (${payment.provider_reference || payment.uuid})`}
      maxWidth="md"
    >
      <form onSubmit={handleRefund} className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Refunds record a separate refund entity and adjust ledger records. Original payment records remain immutable.
          </span>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <Input
          label="Refund Amount (KES)"
          type="number"
          min={1}
          max={payment.amount}
          value={amount || ''}
          onChange={(e) => setAmount(Number(e.target.value))}
          helperText={`Max refundable: ${formatKES(payment.amount)}`}
          required
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
            Reason for Refund
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Job cancelled before printing or customer overpaid"
            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" size="sm" isLoading={isSubmitting}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Confirm Refund
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
