import { request } from './client'
import type { PayrollRecord } from '@/types'

const LOCAL_PAYROLL_KEY = 'vinnyx_payroll_db'

const DEFAULT_PAYROLL: PayrollRecord[] = [
  {
    id: 'pay-2026-11-01',
    staff_id: 1,
    staff_name: 'Jane (Teller #01)',
    role: 'teller',
    month: '2026-11',
    base_salary: 15000,
    total_sales: 85000,
    commission_earned: 12750,
    bonus: 2000,
    deductions: 500,
    net_payout: 29250,
    status: 'draft',
  },
  {
    id: 'pay-2026-11-02',
    staff_id: 2,
    staff_name: 'Mark (Manager)',
    role: 'manager',
    month: '2026-11',
    base_salary: 28000,
    total_sales: 110000,
    commission_earned: 16500,
    bonus: 3000,
    deductions: 0,
    net_payout: 47500,
    status: 'approved',
    approved_by: 'Vincent (Owner)',
  },
  {
    id: 'pay-2026-10-01',
    staff_id: 1,
    staff_name: 'Jane (Teller #01)',
    role: 'teller',
    month: '2026-10',
    base_salary: 15000,
    total_sales: 92000,
    commission_earned: 13800,
    bonus: 1000,
    deductions: 0,
    net_payout: 29800,
    status: 'paid',
    approved_by: 'Vincent (Owner)',
    paid_at: '2026-10-31T17:00:00.000Z',
  },
]

function getLocal(): PayrollRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_PAYROLL_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_PAYROLL
  } catch {
    return DEFAULT_PAYROLL
  }
}

function saveLocal(records: PayrollRecord[]) {
  localStorage.setItem(LOCAL_PAYROLL_KEY, JSON.stringify(records))
}

export const payrollApi = {
  async getRecords(month?: string): Promise<PayrollRecord[]> {
    try {
      const data = await request<PayrollRecord[]>(`/payroll${month ? `?month=${month}` : ''}`)
      return Array.isArray(data) ? data : getLocal()
    } catch {
      const all = getLocal()
      return month ? all.filter((r) => r.month === month) : all
    }
  },

  async approvePayroll(id: string, approverName: string): Promise<PayrollRecord> {
    try {
      return await request<PayrollRecord>(`/payroll/${id}/approve`, { method: 'POST' })
    } catch {
      const records = getLocal()
      const updated = records.map((r) =>
        r.id === id ? { ...r, status: 'approved' as const, approved_by: approverName } : r
      )
      saveLocal(updated)
      return updated.find((r) => r.id === id)!
    }
  },

  async markPaid(id: string): Promise<PayrollRecord> {
    try {
      return await request<PayrollRecord>(`/payroll/${id}/pay`, { method: 'POST' })
    } catch {
      const records = getLocal()
      const updated = records.map((r) =>
        r.id === id ? { ...r, status: 'paid' as const, paid_at: new Date().toISOString() } : r
      )
      saveLocal(updated)
      return updated.find((r) => r.id === id)!
    }
  },
}
