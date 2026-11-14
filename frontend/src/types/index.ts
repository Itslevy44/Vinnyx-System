export type Role = 'owner' | 'manager' | 'teller' | 'repair_teller' | 'customer'
export type UserType = 'staff' | 'customer'

export interface User {
  id: number
  name: string
  email: string | null
  phone: string | null
  role: Role
  teller_number?: number // e.g. 10 or 11 for electronics & repair specialists
  user_type: UserType
  is_active: boolean
  last_login_at: string | null
}

export interface AuthProviderInfo {
  key: string
  name: string
  is_enabled: boolean
  allowed_user_types: UserType[]
  icon?: string
  description?: string
}

export type PaymentMethodCode = 
  | 'cash' 
  | 'mpesa_stk' 
  | 'mpesa_manual' 
  | 'card' 
  | 'airtel' 
  | 'bank' 
  | 'credit'

export interface PaymentMethod {
  code: PaymentMethodCode
  display_name: string
  driver: string
  channels: ('in_shop' | 'online')[]
  is_active: boolean
  sort_order: number
}

export type PaymentStatus = 
  | 'initiated' 
  | 'pending' 
  | 'succeeded' 
  | 'failed' 
  | 'cancelled' 
  | 'expired' 
  | 'refunded' 
  | 'partially_refunded'

export interface Payment {
  uuid: string
  payable_type: string
  payable_id: number | string
  method_code: PaymentMethodCode
  amount: number
  currency: string
  status: PaymentStatus
  provider_reference?: string | null
  idempotency_key?: string
  payer_phone?: string | null
  initiated_by?: number
  initiated_at: string
  completed_at?: string | null
  failure_reason?: string | null
}

export interface ServiceItem {
  id: number
  name: string
  category: 'printing' | 'cyber' | 'design' | 'eulogy' | 'laminating' | 'other'
  price: number
  default_commission_rate: number // e.g. 10 means 10%
}

export interface SaleLineItem {
  id?: string
  service_id: number
  service_name: string
  quantity: number
  unit_price: number
  total_price: number
  commission_rate: number
  commission_amount: number
  teller_id?: number
}

export interface Sale {
  id: string
  sale_number: string
  branch_id: number
  teller_id: number
  teller_name: string
  customer_name?: string
  customer_phone?: string
  items: SaleLineItem[]
  subtotal: number
  discount: number
  total: number
  amount_paid: number
  balance: number
  payment_status: 'paid' | 'partial' | 'pending' | 'voided'
  payments: Payment[]
  created_at: string
}

export interface Expense {
  id: string
  branch_id: number
  category: 'rent' | 'utilities' | 'stationery' | 'repairs' | 'staff_tea' | 'other'
  amount: number
  description: string
  receipt_ref?: string
  recorded_by: string
  created_at: string
}

export interface DayCloseSession {
  id: string
  branch_id: number
  date: string
  status: 'open' | 'closed'
  opened_at: string
  closed_at?: string
  closed_by?: string
  expected_totals: Record<PaymentMethodCode, number>
  counted_totals: Record<PaymentMethodCode, number>
  variances: Record<PaymentMethodCode, number>
  notes?: string
}

export interface ApiError {
  message: string
  code?: string
  errors?: Record<string, string[]>
}

export interface InventoryItem {
  id: number
  sku: string
  name: string
  category: 'stationery' | 'accessories' | 'hardware' | 'toner' | 'cables' | 'other'
  cost_price: number
  selling_price: number
  quantity_in_stock: number
  reorder_level: number
  unit: string
  is_active: boolean
}

export type RepairStatus =
  | 'received'
  | 'diagnosing'
  | 'waiting_parts'
  | 'repaired'
  | 'ready_for_pickup'
  | 'collected'
  | 'cancelled'

export interface RepairTicket {
  id: string
  ticket_number: string
  branch_id: number
  customer_name: string
  customer_phone: string
  device_type: string
  brand_model: string
  serial_number?: string
  reported_fault: string
  diagnosis?: string
  technician_name?: string
  estimated_cost: number
  actual_cost: number
  deposit_paid: number
  status: RepairStatus
  created_at: string
  completed_at?: string
  collected_at?: string
  intake_slip_ref?: string
}

export interface PayrollRecord {
  id: string
  staff_id: number
  staff_name: string
  role: Role
  month: string // e.g. "2026-11"
  base_salary: number
  total_sales: number
  commission_earned: number
  bonus: number
  deductions: number
  net_payout: number
  status: 'draft' | 'approved' | 'paid'
  approved_by?: string
  paid_at?: string
}

export interface CustomerOrder {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  service_type: string
  description: string
  file_attachment_url?: string
  status: 'pending' | 'in_progress' | 'ready' | 'completed' | 'cancelled'
  quoted_amount: number
  deposit_paid: number
  balance: number
  created_at: string
}

export interface AuditLogEntry {
  id: string
  event: string // e.g. "sale.voided", "provider.toggled", "day.closed", "login.failed"
  user_name: string
  user_role: string
  ip_address: string
  details: string
  created_at: string
}

export interface ServiceRequest {
  id: string
  request_number: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  service_category: 'printing' | 'cyber_gov' | 'design' | 'eulogy' | 'repair' | 'other'
  description: string
  urgency: 'normal' | 'urgent'
  status: 'new' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  assigned_teller_name?: string
  assigned_teller_id?: number
  created_at: string
  quoted_amount?: number
}

export interface ShopProduct {
  id: number
  sku: string
  name: string
  category: 'electronics' | 'stationery' | 'cyber_tools' | 'printers'
  price: number
  cost_price: number
  in_stock: number
  unit: string
  description: string
  image_url: string
  badge?: string
}


