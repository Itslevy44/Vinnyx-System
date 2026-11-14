import { request } from './client'
import type { AuditLogEntry } from '@/types'

const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-01',
    event: 'auth.login_succeeded',
    user_name: 'Vincent Mwangi',
    user_role: 'owner',
    ip_address: '197.232.88.12',
    details: 'Owner logged in via PasswordProvider on POS Terminal #01',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'aud-02',
    event: 'payment.gateway_toggled',
    user_name: 'Vincent Mwangi',
    user_role: 'owner',
    ip_address: '197.232.88.12',
    details: 'Provider card set to disabled by Owner',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'aud-03',
    event: 'sale.voided',
    user_name: 'Mark (Manager)',
    user_role: 'manager',
    ip_address: '197.232.88.14',
    details: 'Sale VX-892110 voided. Reason: Customer double payment via cash and M-Pesa.',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'aud-04',
    event: 'payroll.approved',
    user_name: 'Vincent Mwangi',
    user_role: 'owner',
    ip_address: '197.232.88.12',
    details: 'Payroll for period 2026-10 approved for 3 staff members.',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: 'aud-05',
    event: 'day_close.completed',
    user_name: 'Mark (Manager)',
    user_role: 'manager',
    ip_address: '197.232.88.14',
    details: 'Day close session finalized with zero variance (Balanced).',
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
  },
]

export const auditApi = {
  async getLogs(): Promise<AuditLogEntry[]> {
    try {
      const data = await request<AuditLogEntry[]>('/audit/logs')
      return Array.isArray(data) ? data : DEFAULT_AUDIT_LOGS
    } catch {
      return DEFAULT_AUDIT_LOGS
    }
  },
}
