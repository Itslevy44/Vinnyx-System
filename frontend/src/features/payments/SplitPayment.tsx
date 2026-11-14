import React, { useState } from 'react'
import type { Payment, PaymentMethodCode } from '@/types'
import { PaymentMethodPicker } from './PaymentMethodPicker'
import { StkWaitingScreen } from './StkWaitingScreen'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatKES } from '@/lib/utils'
import { Plus, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react'

interface SplitPaymentProps {
  totalAmount: number
  existingPayments?: Payment[]
  onComplete: (payments: Payment[]) => void
  onCancel: () => void
  allowDeposit?: boolean
}

export const SplitPayment: React.FC<SplitPaymentProps> = ({
  totalAmount,
  existingPayments = [],
  onComplete,
  onCancel,
  allowDeposit = true,
}) => {
  const [payments, setPayments] = useState<Payment[]>(existingPayments)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodCode>('cash')
  const [currentAmount, setCurrentAmount] = useState<number>(0)
  const [referenceCode, setReferenceCode] = useState<string>('')
  const [payerPhone, setPayerPhone] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isStkActive, setIsStkActive] = useState<boolean>(false)

  const paidSoFar = payments.reduce((acc, p) => acc + p.amount, 0)
  const remaining = Math.max(0, totalAmount - paidSoFar)

  // Initialize slice amount with whatever is remaining
  React.useEffect(() => {
    if (remaining > 0 && currentAmount === 0) {
      setCurrentAmount(remaining)
    }
  }, [remaining, currentAmount])

  const handleAddPayment = () => {
    setError(null)
    if (currentAmount <= 0) {
      setError('Payment amount must be greater than 0.')
      return
    }

    if (currentAmount > remaining) {
      setError(`Amount cannot exceed the remaining balance of ${formatKES(remaining)}.`)
      return
    }

    if (selectedMethod === 'mpesa_manual') {
      const trimmedCode = referenceCode.trim().toUpperCase()
      if (!trimmedCode || trimmedCode.length < 6) {
        setError('Please enter a valid M-Pesa transaction code (e.g. QKH8923KLJ).')
        return
      }

      // Guideline 3.6: "duplicate codes blocked"
      const isDuplicate = payments.some(
        (p) => p.provider_reference?.toUpperCase() === trimmedCode
      )
      if (isDuplicate) {
        setError('Duplicate M-Pesa receipt code! This code has already been recorded in this session.')
        return
      }

      const newPayment: Payment = {
        uuid: 'pay-' + Math.random().toString(36).substring(2, 9),
        payable_type: 'Sale',
        payable_id: 'pending',
        method_code: 'mpesa_manual',
        amount: currentAmount,
        currency: 'KES',
        status: 'succeeded',
        provider_reference: trimmedCode,
        payer_phone: payerPhone || null,
        initiated_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      }

      const updated = [...payments, newPayment]
      setPayments(updated)
      setReferenceCode('')
      setPayerPhone('')
      setCurrentAmount(Math.max(0, totalAmount - updated.reduce((a, b) => a + b.amount, 0)))
      return
    }

    if (selectedMethod === 'mpesa_stk') {
      if (!payerPhone || payerPhone.length < 9) {
        setError('Please enter the customer phone number for M-Pesa STK push.')
        return
      }
      setIsStkActive(true)
      return
    }

    // Cash or others
    const newPayment: Payment = {
      uuid: 'pay-' + Math.random().toString(36).substring(2, 9),
      payable_type: 'Sale',
      payable_id: 'pending',
      method_code: selectedMethod,
      amount: currentAmount,
      currency: 'KES',
      status: 'succeeded',
      provider_reference: selectedMethod === 'cash' ? 'CASH-' + Date.now().toString().slice(-4) : referenceCode || null,
      initiated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    }

    const updated = [...payments, newPayment]
    setPayments(updated)
    setReferenceCode('')
    setCurrentAmount(Math.max(0, totalAmount - updated.reduce((a, b) => a + b.amount, 0)))
  }

  const handleStkSuccess = (ref: string) => {
    setIsStkActive(false)
    const newPayment: Payment = {
      uuid: 'pay-' + Math.random().toString(36).substring(2, 9),
      payable_type: 'Sale',
      payable_id: 'pending',
      method_code: 'mpesa_stk',
      amount: currentAmount,
      currency: 'KES',
      status: 'succeeded',
      provider_reference: ref,
      payer_phone: payerPhone,
      initiated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    }

    const updated = [...payments, newPayment]
    setPayments(updated)
    setPayerPhone('')
    setCurrentAmount(Math.max(0, totalAmount - updated.reduce((a, b) => a + b.amount, 0)))
  }

  const handleRemovePayment = (index: number) => {
    const updated = payments.filter((_, i) => i !== index)
    setPayments(updated)
    const newRemaining = totalAmount - updated.reduce((a, b) => a + b.amount, 0)
    setCurrentAmount(newRemaining)
  }

  const canFinish = payments.length > 0 && (remaining === 0 || allowDeposit)

  return (
    <div className="space-y-5">
      {/* Summary Banner */}
      <div className="grid grid-cols-3 gap-2 bg-blue-50 border border-blue-200 text-gray-900 p-3.5 rounded-xl text-center">
        <div>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Total Due</span>
          <span className="text-base font-bold text-gray-900">{formatKES(totalAmount)}</span>
        </div>
        <div className="border-x border-blue-200">
          <span className="text-[10px] text-blue-600 uppercase tracking-wider block">Allocated</span>
          <span className="text-base font-bold text-blue-700">{formatKES(paidSoFar)}</span>
        </div>
        <div>
          <span className="text-[10px] text-amber-600 uppercase tracking-wider block">Remaining</span>
          <span className={`text-base font-bold ${remaining === 0 ? 'text-blue-600' : 'text-amber-600'}`}>
            {formatKES(remaining)}
          </span>
        </div>
      </div>

      {isStkActive ? (
        <StkWaitingScreen
          phone={payerPhone}
          amount={currentAmount}
          onSuccess={handleStkSuccess}
          onCancel={() => setIsStkActive(false)}
          onFallbackManual={() => {
            setIsStkActive(false)
            setSelectedMethod('mpesa_manual')
          }}
        />
      ) : (
        <>
          {/* Method selector */}
          {remaining > 0 && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <PaymentMethodPicker
                selectedMethod={selectedMethod}
                onSelectMethod={(m) => {
                  setSelectedMethod(m)
                  setError(null)
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Input
                  label="Amount for this method (KES)"
                  type="number"
                  min={1}
                  max={remaining}
                  value={currentAmount || ''}
                  onChange={(e) => setCurrentAmount(Number(e.target.value))}
                />

                {selectedMethod === 'mpesa_manual' && (
                  <Input
                    label="M-Pesa Receipt Code"
                    placeholder="e.g. QKH8923KLJ"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value.toUpperCase())}
                    helperText="Required: Verify on your till before entering"
                  />
                )}

                {selectedMethod === 'mpesa_stk' && (
                  <Input
                    label="Customer Phone (STK)"
                    type="tel"
                    placeholder="0712 345 678"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    helperText="Will prompt the customer for PIN"
                  />
                )}

                {selectedMethod === 'credit' && (
                  <Input
                    label="Customer Name / Account"
                    placeholder="Regular Customer Name"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    helperText="Requires manager approval"
                  />
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleAddPayment}
                className="w-full text-blue-700 border-blue-300 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Payment Slice ({formatKES(currentAmount)})
              </Button>
            </div>
          )}

          {/* List of payments collected so far */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Recorded Payment Slices ({payments.length})
            </h4>

            {payments.length === 0 ? (
              <div className="text-xs text-gray-400 p-4 border border-dashed rounded-lg text-center">
                No payments added yet. Select a gateway above to record a payment.
              </div>
            ) : (
              <div className="space-y-2">
                {payments.map((p, idx) => (
                  <div
                    key={p.uuid || idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 capitalize">
                            {p.method_code.replace('_', ' ')}
                          </span>
                          <Badge variant="success">Confirmed</Badge>
                        </div>
                        {p.provider_reference && (
                          <span className="text-[11px] font-mono text-gray-500 block">
                            Ref: {p.provider_reference}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">{formatKES(p.amount)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePayment(idx)}
                        className="text-gray-400 hover:text-rose-600 transition-colors"
                        title="Remove payment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <Button variant="ghost" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!canFinish}
              onClick={() => onComplete(payments)}
              className="flex-1"
            >
              {remaining === 0 ? 'Complete Full Payment' : `Accept Partial Deposit (${formatKES(paidSoFar)})`}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
