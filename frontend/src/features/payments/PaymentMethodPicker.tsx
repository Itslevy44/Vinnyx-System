import React, { useState, useEffect } from 'react'
import { paymentsApi } from '@/api/payments'
import type { PaymentMethod, PaymentMethodCode } from '@/types'
import { Banknote, Smartphone, CreditCard, UserCheck, QrCode } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentMethodPickerProps {
  selectedMethod: PaymentMethodCode
  onSelectMethod: (code: PaymentMethodCode) => void
  channel?: 'in_shop' | 'online'
}

export const PaymentMethodPicker: React.FC<PaymentMethodPickerProps> = ({
  selectedMethod,
  onSelectMethod,
  channel = 'in_shop',
}) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    paymentsApi.getMethods(channel).then((list) => {
      setMethods(list)
      setLoading(false)
    })
  }, [channel])

  const getMethodIcon = (code: PaymentMethodCode) => {
    switch (code) {
      case 'cash':
        return <Banknote className="h-5 w-5 text-blue-600" />
      case 'mpesa_manual':
        return <QrCode className="h-5 w-5 text-green-600" />
      case 'mpesa_stk':
        return <Smartphone className="h-5 w-5 text-green-600" />
      case 'card':
        return <CreditCard className="h-5 w-5 text-blue-600" />
      case 'credit':
        return <UserCheck className="h-5 w-5 text-indigo-600" />
      default:
        return <Banknote className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return <div className="text-xs text-gray-500 py-3 text-center">Loading payment gateways...</div>
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
        Select Payment Gateway
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {methods.map((method) => {
          const isSelected = selectedMethod === method.code
          return (
            <button
              key={method.code}
              type="button"
              onClick={() => onSelectMethod(method.code)}
              className={cn(
                'flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer relative',
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
              )}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="p-1.5 rounded-lg bg-white shadow-xs border border-gray-100">
                  {getMethodIcon(method.code)}
                </div>
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                )}
              </div>
              <span className="font-semibold text-xs text-gray-900 leading-snug">
                {method.display_name}
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5">
                {method.driver.replace('Gateway', '')}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
