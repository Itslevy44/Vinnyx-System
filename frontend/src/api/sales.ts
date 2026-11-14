import { request, generateIdempotencyKey } from './client'
import type { ServiceItem, Sale, SaleLineItem, Payment } from '@/types'

export const INITIAL_SERVICES: ServiceItem[] = [
  { id: 1, name: 'B&W Printing (Per Page)', category: 'printing', price: 10, default_commission_rate: 10 },
  { id: 2, name: 'Colour Printing (Per Page)', category: 'printing', price: 30, default_commission_rate: 10 },
  { id: 3, name: 'Photocopy (B&W)', category: 'printing', price: 5, default_commission_rate: 10 },
  { id: 4, name: 'Scanning to Email/Flash', category: 'cyber', price: 20, default_commission_rate: 15 },
  { id: 5, name: 'Online Application (KRA, NTSA, HELB)', category: 'cyber', price: 200, default_commission_rate: 25 },
  { id: 6, name: 'Typing & Editing (Per Page)', category: 'cyber', price: 50, default_commission_rate: 20 },
  { id: 7, name: 'Eulogy Booklet Design & Print', category: 'eulogy', price: 1500, default_commission_rate: 15 },
  { id: 8, name: 'Graphic Design / Logo / Flyer', category: 'design', price: 800, default_commission_rate: 20 },
  { id: 9, name: 'Lamination (A4)', category: 'laminating', price: 50, default_commission_rate: 15 },
  { id: 10, name: 'Spiral Binding', category: 'printing', price: 100, default_commission_rate: 15 },
  { id: 11, name: 'Passport Photos (Set of 4)', category: 'cyber', price: 150, default_commission_rate: 20 },
]

export interface CreateSalePayload {
  branch_id?: number
  customer_name?: string
  customer_phone?: string
  items: Omit<SaleLineItem, 'id'>[]
  discount?: number
  payments: Payment[]
}

const LOCAL_STORAGE_SALES_KEY = 'vinnyx_sales_db'

function getLocalSales(): Sale[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SALES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalSales(sales: Sale[]) {
  localStorage.setItem(LOCAL_STORAGE_SALES_KEY, JSON.stringify(sales))
}

export const salesApi = {
  async getServices(): Promise<ServiceItem[]> {
    try {
      const data = await request<ServiceItem[]>('/services')
      return Array.isArray(data) ? data : INITIAL_SERVICES
    } catch {
      return INITIAL_SERVICES
    }
  },

  async getSales(): Promise<Sale[]> {
    try {
      const data = await request<Sale[]>('/sales')
      return Array.isArray(data) ? data : getLocalSales()
    } catch {
      return getLocalSales()
    }
  },

  async createSale(payload: CreateSalePayload): Promise<Sale> {
    const key = generateIdempotencyKey()
    try {
      return await request<Sale>('/sales', {
        method: 'POST',
        idempotencyKey: key,
        body: JSON.stringify(payload),
      })
    } catch (err: any) {
      if (err.status === 0 || err.status === 404) {
        // Fallback local save so POS operates seamlessly
        const subtotal = payload.items.reduce((acc, item) => acc + item.total_price, 0)
        const discount = payload.discount || 0
        const total = Math.max(0, subtotal - discount)
        const amountPaid = payload.payments
          .filter((p) => p.status === 'succeeded')
          .reduce((acc, p) => acc + p.amount, 0)
        const balance = Math.max(0, total - amountPaid)

        const newSale: Sale = {
          id: 'sale-' + Date.now(),
          sale_number: 'VX-' + Math.floor(100000 + Math.random() * 900000),
          branch_id: payload.branch_id || 1,
          teller_id: 1,
          teller_name: 'Current Teller',
          customer_name: payload.customer_name || 'Walk-in Customer',
          customer_phone: payload.customer_phone || '',
          items: payload.items.map((it, idx) => ({ ...it, id: 'item-' + idx })),
          subtotal,
          discount,
          total,
          amount_paid: amountPaid,
          balance,
          payment_status: balance === 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'pending',
          payments: payload.payments,
          created_at: new Date().toISOString(),
        }

        const existing = getLocalSales()
        saveLocalSales([newSale, ...existing])
        return newSale
      }
      throw err
    }
  },

  async voidSale(saleId: string, reason: string): Promise<void> {
    try {
      await request(`/sales/${saleId}/void`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
    } catch {
      const sales = getLocalSales()
      const updated = sales.map((s) => (s.id === saleId ? { ...s, payment_status: 'voided' as const } : s))
      saveLocalSales(updated)
    }
  },
}
