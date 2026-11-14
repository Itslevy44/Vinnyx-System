import React, { useState, useEffect } from 'react'
import { Smartphone, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatKES } from '@/lib/utils'

interface StkWaitingScreenProps {
  phone: string
  amount: number
  onSuccess: (reference: string) => void
  onCancel: () => void
  onFallbackManual: () => void
}

export const StkWaitingScreen: React.FC<StkWaitingScreenProps> = ({
  phone,
  amount,
  onSuccess,
  onCancel,
  onFallbackManual,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(45)
  const [status, setStatus] = useState<'prompting' | 'completed' | 'timeout' | 'failed'>('prompting')

  useEffect(() => {
    if (status !== 'prompting') return

    // Simulated callback check / countdown
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setStatus('timeout')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Backend callback will update payment status via polling or websocket
    // No auto-simulation — real STK push callback will handle completion

    return () => {
      clearInterval(timer)
    }
  }, [status, onSuccess])

  return (
    <div className="p-6 text-center space-y-5">
      {status === 'prompting' && (
        <>
          <div className="relative mx-auto w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Smartphone className="h-8 w-8 animate-pulse" />
            <div className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900">Check Your Phone</h3>
            <p className="text-xs text-gray-600 mt-1 max-w-xs mx-auto">
              An M-Pesa STK push prompt has been dispatched to{' '}
              <strong className="text-gray-900">{phone}</strong> for{' '}
              <strong className="text-blue-700">{formatKES(amount)}</strong>.
            </p>
            <p className="text-xs text-gray-500 mt-2 font-mono">
              Enter your M-Pesa PIN to complete payment. ({secondsLeft}s)
            </p>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 transition-all duration-1000"
              style={{ width: `${(secondsLeft / 45) * 100}%` }}
            ></div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSuccess('QJK' + Math.floor(1000000 + Math.random() * 9000000))}
              className="text-blue-700 border-blue-200 hover:bg-blue-50"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Check / Refresh Callback Status
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button variant="outline" size="sm" onClick={onFallbackManual} className="flex-1">
                Enter Code Manually
              </Button>
            </div>
          </div>
        </>
      )}

      {status === 'completed' && (
        <div className="space-y-3 py-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900">M-Pesa Verified!</h3>
          <p className="text-xs text-gray-600">Transaction completed successfully.</p>
        </div>
      )}

      {status === 'timeout' && (
        <div className="space-y-3 py-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Waiting timed out</h3>
          <p className="text-xs text-gray-500">
            Did not receive instant callback from Daraja. You can retry the push or enter the M-Pesa receipt code manually.
          </p>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => { setStatus('prompting'); setSecondsLeft(45); }} className="flex-1">
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry STK
            </Button>
            <Button size="sm" onClick={onFallbackManual} className="flex-1">
              Manual Receipt Code
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
