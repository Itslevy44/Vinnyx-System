import { request } from './client'
import type { CustomerOrder } from '@/types'

const LOCAL_ORDERS_KEY = 'vinnyx_orders_db'

const DEFAULT_ORDERS: CustomerOrder[] = [
  {
    id: 'ord-101',
    order_number: 'ORD-2026-441',
    customer_name: 'St. Mary High School',
    customer_phone: '0712889900',
    customer_email: 'principal@stmary.ac.ke',
    service_type: 'Exam Booklet Printing & Binding',
    description: '500 copies of term exam booklets, card cover, stapled & taped.',
    status: 'in_progress',
    quoted_amount: 15000,
    deposit_paid: 10000,
    balance: 5000,
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'ord-102',
    order_number: 'ORD-2026-442',
    customer_name: 'Daniel Kariuki',
    customer_phone: '0722112233',
    service_type: 'Eulogy Program Graphic Design & Print',
    description: '200 A5 color eulogy booklets on glossy 150gsm paper.',
    status: 'ready',
    quoted_amount: 6000,
    deposit_paid: 3000,
    balance: 3000,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'ord-103',
    order_number: 'ORD-2026-443',
    customer_name: 'Purity Wanjiru',
    customer_phone: '0799445566',
    service_type: 'Company Profile & Business Cards',
    description: 'Logo redesign, 20-page profile print (10 copies), 200 business cards.',
    status: 'pending',
    quoted_amount: 8500,
    deposit_paid: 2000,
    balance: 6500,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
]

function getLocal(): CustomerOrder[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_ORDERS
  } catch {
    return DEFAULT_ORDERS
  }
}

function saveLocal(orders: CustomerOrder[]) {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders))
}

export const ordersApi = {
  async getOrders(): Promise<CustomerOrder[]> {
    try {
      const data = await request<CustomerOrder[]>('/orders')
      return Array.isArray(data) ? data : getLocal()
    } catch {
      return getLocal()
    }
  },

  async createOrder(payload: Omit<CustomerOrder, 'id' | 'order_number' | 'created_at'>): Promise<CustomerOrder> {
    try {
      return await request<CustomerOrder>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch {
      const items = getLocal()
      const newOrder: CustomerOrder = {
        id: 'ord-' + Date.now(),
        order_number: 'ORD-2026-' + Math.floor(100 + Math.random() * 900),
        ...payload,
        created_at: new Date().toISOString(),
      }
      saveLocal([newOrder, ...items])
      return newOrder
    }
  },

  async updateStatus(id: string, status: CustomerOrder['status']): Promise<CustomerOrder> {
    try {
      return await request<CustomerOrder>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
    } catch {
      const items = getLocal()
      const updated = items.map((o) => (o.id === id ? { ...o, status } : o))
      saveLocal(updated)
      return updated.find((o) => o.id === id)!
    }
  },
}
