import { request } from './client'
import type { ServiceRequest } from '@/types'

const LOCAL_REQUESTS_KEY = 'vinnyx_service_requests_db'

const DEFAULT_REQUESTS: ServiceRequest[] = [
  {
    id: 'req-01',
    request_number: 'REQ-2026-901',
    customer_name: 'Beatrice Njeri',
    customer_phone: '0712334455',
    customer_email: 'beatrice@gmail.com',
    service_category: 'cyber_gov',
    description: 'KRA PIN Certificate retrieval and tax return filing assistance.',
    urgency: 'urgent',
    status: 'new',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    quoted_amount: 300,
  },
  {
    id: 'req-02',
    request_number: 'REQ-2026-902',
    customer_name: 'John Kiptoo',
    customer_phone: '0722119988',
    service_category: 'design',
    description: 'Need business logo and 300 flyers designed and printed for a launch event next week.',
    urgency: 'normal',
    status: 'in_progress',
    assigned_teller_name: 'Jane (Teller #01)',
    assigned_teller_id: 1,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    quoted_amount: 3500,
  },
  {
    id: 'req-03',
    request_number: 'REQ-2026-903',
    customer_name: 'Faith Achieng',
    customer_phone: '0799443322',
    service_category: 'printing',
    description: 'Master’s Thesis printing (180 pages, 3 copies) and hardcover gold foil binding.',
    urgency: 'normal',
    status: 'new',
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    quoted_amount: 4500,
  },
  {
    id: 'req-04',
    request_number: 'REQ-2026-904',
    customer_name: 'Moses Mwangi',
    customer_phone: '0733557799',
    service_category: 'repair',
    description: 'Lenovo laptop screen replacement quote and diagnostic.',
    urgency: 'urgent',
    status: 'assigned',
    assigned_teller_name: 'Alex (Teller #10 - Repairs)',
    assigned_teller_id: 10,
    created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
    quoted_amount: 6500,
  },
]

function getLocal(): ServiceRequest[] {
  try {
    const raw = localStorage.getItem(LOCAL_REQUESTS_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_REQUESTS
  } catch {
    return DEFAULT_REQUESTS
  }
}

function cleanInput(str?: string): string {
  if (!str) return ''
  return str.trim().replace(/[<>]/g, '')
}

function saveLocal(items: ServiceRequest[]) {
  localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(items))
}

export const serviceRequestsApi = {
  async getRequests(category?: string, tellerId?: number): Promise<ServiceRequest[]> {
    try {
      const data = await request<ServiceRequest[]>('/service-requests')
      return Array.isArray(data) ? data : getLocal()
    } catch {
      let list = getLocal()
      if (category && category !== 'all') {
        list = list.filter((r) => r.service_category === category)
      }
      if (tellerId !== undefined) {
        // Return requests assigned to this teller or unassigned (status === 'new')
        list = list.filter((r) => r.assigned_teller_id === tellerId || !r.assigned_teller_id)
      }
      return list
    }
  },

  async submitPublicRequest(data: Omit<ServiceRequest, 'id' | 'request_number' | 'created_at' | 'status'>): Promise<ServiceRequest> {
    const sanitizedData = {
      ...data,
      customer_name: cleanInput(data.customer_name),
      customer_phone: cleanInput(data.customer_phone),
      description: cleanInput(data.description),
      customer_email: data.customer_email ? cleanInput(data.customer_email) : undefined,
    }
    try {
      return await request<ServiceRequest>('/public/service-requests', {
        method: 'POST',
        body: JSON.stringify(sanitizedData),
      })
    } catch {
      const items = getLocal()
      const newReq: ServiceRequest = {
        id: 'req-' + Date.now(),
        request_number: 'REQ-2026-' + Math.floor(100 + Math.random() * 900),
        status: 'new',
        created_at: new Date().toISOString(),
        ...sanitizedData,
      }
      saveLocal([newReq, ...items])
      return newReq
    }
  },

  async updateRequestStatus(id: string, status: ServiceRequest['status'], tellerName?: string, tellerId?: number): Promise<ServiceRequest> {
    try {
      return await request<ServiceRequest>(`/service-requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, tellerName, tellerId }),
      })
    } catch {
      const items = getLocal()
      const updated = items.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status,
            assigned_teller_name: tellerName || r.assigned_teller_name,
            assigned_teller_id: tellerId !== undefined ? tellerId : r.assigned_teller_id,
          }
        }
        return r
      })
      saveLocal(updated)
      return updated.find((r) => r.id === id)!
    }
  },
}
