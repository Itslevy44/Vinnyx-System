import { request, generateIdempotencyKey } from './client'
import type { PaymentMethod, Payment, PaymentMethodCode } from '@/types'

export const FALLBACK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    code: 'cash',
    display_name: 'Cash Payment',
    driver: 'CashGateway',
    channels: ['in_shop'],
    is_active: true,
    sort_order: 1,
  },
  {
    code: 'mpesa_manual',
    display_name: 'M-Pesa (Till / Paybill Manual Code)',
    driver: 'MpesaManualGateway',
    channels: ['in_shop'],
    is_active: true,
    sort_order: 2,
  },
  {
    code: 'mpesa_stk',
    display_name: 'M-Pesa Express (STK Push)',
    driver: 'MpesaStkGateway',
    channels: ['in_shop', 'online'],
    is_active: true,
    sort_order: 3,
  },
  {
    code: 'card',
    display_name: 'Credit / Debit Card',
    driver: 'CardGateway',
    channels: ['in_shop', 'online'],
    is_active: false,
    sort_order: 4,
  },
  {
    code: 'credit',
    display_name: 'Customer Account Credit',
    driver: 'CreditGateway',
    channels: ['in_shop'],
    is_active: true,
    sort_order: 5,
  },
]

export interface CreatePaymentPayload {
  payable_type: string
  payable_id: string | number
  method_code: PaymentMethodCode
  amount: number
  currency?: string
  payer_phone?: string
  provider_reference?: string // M-Pesa transaction code e.g. 'SHG78291KZ'
  idempotency_key?: string
}

export const paymentsApi = {
  async getMethods(channel: 'in_shop' | 'online' = 'in_shop'): Promise<PaymentMethod[]> {
    try {
      const data = await request<PaymentMethod[]>(`/payment-methods?channel=${channel}`)
      return Array.isArray(data) ? data : (data as any)?.methods || FALLBACK_PAYMENT_METHODS
    } catch {
      return FALLBACK_PAYMENT_METHODS.filter((m) => m.channels.includes(channel) && m.is_active)
    }
  },

  async createPayment(payload: CreatePaymentPayload): Promise<Payment> {
    const key = payload.idempotency_key || generateIdempotencyKey()
    try {
      return await request<Payment>('/payments', {
        method: 'POST',
        idempotencyKey: key,
        body: JSON.stringify({
          ...payload,
          currency: payload.currency || 'KES',
        }),
      })
    } catch (err: any) {
      if (err.status === 0 || err.status === 404) {
        // Mock payment response for local UI flow
        const isMpesaManual = payload.method_code === 'mpesa_manual'
        const isCash = payload.method_code === 'cash'

        const payment: Payment = {
          uuid: 'pay-' + Math.random().toString(36).substring(2, 10),
          payable_type: payload.payable_type,
          payable_id: payload.payable_id,
          method_code: payload.method_code,
          amount: payload.amount,
          currency: payload.currency || 'KES',
          status: isCash || isMpesaManual ? 'succeeded' : 'pending',
          provider_reference: payload.provider_reference || (isCash ? 'CASH-' + Date.now().toString().slice(-6) : null),
          payer_phone: payload.payer_phone,
          initiated_at: new Date().toISOString(),
          completed_at: isCash || isMpesaManual ? new Date().toISOString() : null,
        }
        return payment
      }
      throw err
    }
  },

  async pollStatus(uuid: string): Promise<Payment> {
    return request<Payment>(`/payments/${uuid}`)
  },

  async refund(paymentId: string, amount: number, reason: string) {
    return request(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    })
  },
}
