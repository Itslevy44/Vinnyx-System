import { request } from './client'
import type { RepairTicket, RepairStatus } from '@/types'

const LOCAL_REPAIRS_KEY = 'vinnyx_repairs_db'

const DEFAULT_REPAIRS: RepairTicket[] = [
  {
    id: 'rep-101',
    ticket_number: 'REP-2026-089',
    branch_id: 1,
    customer_name: 'Peter Kamau',
    customer_phone: '0722334455',
    device_type: 'Laptop',
    brand_model: 'HP ProBook 450 G5',
    serial_number: '5CD8391KLP',
    reported_fault: 'Overheating and slow performance. Fan making rattling noise.',
    diagnosis: 'Thermal paste dried up. Needs deep heatsink cleaning and fan lubrication.',
    technician_name: 'Mark (Manager)',
    estimated_cost: 2500,
    actual_cost: 2500,
    deposit_paid: 1000,
    status: 'repaired',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'rep-102',
    ticket_number: 'REP-2026-090',
    branch_id: 1,
    customer_name: 'Grace Wambui',
    customer_phone: '0711998877',
    device_type: 'Desktop CPU',
    brand_model: 'Dell OptiPlex 7050',
    serial_number: '7F902KL',
    reported_fault: 'No display on monitor, power LED blinks amber 2-1.',
    diagnosis: 'Faulty RAM module slot 1. Testing motherboard power rails.',
    technician_name: 'Vincent (Owner)',
    estimated_cost: 3200,
    actual_cost: 0,
    deposit_paid: 500,
    status: 'diagnosing',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'rep-103',
    ticket_number: 'REP-2026-091',
    branch_id: 1,
    customer_name: 'Samuel Otieno',
    customer_phone: '0733556677',
    device_type: 'Printer',
    brand_model: 'Epson EcoTank L3150',
    reported_fault: 'Paper jam error light flashing, black ink streaks on printouts.',
    diagnosis: 'Waiting for pickup roller assembly replacement part.',
    technician_name: 'Mark (Manager)',
    estimated_cost: 3800,
    actual_cost: 0,
    deposit_paid: 1500,
    status: 'waiting_parts',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
]

function getLocal(): RepairTicket[] {
  try {
    const raw = localStorage.getItem(LOCAL_REPAIRS_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_REPAIRS
  } catch {
    return DEFAULT_REPAIRS
  }
}

function saveLocal(repairs: RepairTicket[]) {
  localStorage.setItem(LOCAL_REPAIRS_KEY, JSON.stringify(repairs))
}

export const repairsApi = {
  async getTickets(): Promise<RepairTicket[]> {
    try {
      const data = await request<RepairTicket[]>('/repairs')
      return Array.isArray(data) ? data : getLocal()
    } catch {
      return getLocal()
    }
  },

  async createTicket(payload: Omit<RepairTicket, 'id' | 'ticket_number' | 'created_at'>): Promise<RepairTicket> {
    try {
      return await request<RepairTicket>('/repairs', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch {
      const items = getLocal()
      const ticketNum = 'REP-2026-' + Math.floor(100 + Math.random() * 900)
      const newTicket: RepairTicket = {
        id: 'rep-' + Date.now(),
        ticket_number: ticketNum,
        ...payload,
        created_at: new Date().toISOString(),
      }
      saveLocal([newTicket, ...items])
      return newTicket
    }
  },

  async updateStatus(id: string, status: RepairStatus, diagnosis?: string, actual_cost?: number): Promise<RepairTicket> {
    try {
      return await request<RepairTicket>(`/repairs/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, diagnosis, actual_cost }),
      })
    } catch {
      const items = getLocal()
      const updated = items.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status,
            diagnosis: diagnosis !== undefined ? diagnosis : r.diagnosis,
            actual_cost: actual_cost !== undefined ? actual_cost : r.actual_cost,
            completed_at: status === 'repaired' || status === 'ready_for_pickup' ? new Date().toISOString() : r.completed_at,
            collected_at: status === 'collected' ? new Date().toISOString() : r.collected_at,
          }
        }
        return r
      })
      saveLocal(updated)
      return updated.find((r) => r.id === id)!
    }
  },
}
