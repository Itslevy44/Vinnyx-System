import { request } from './client'

export interface ProviderSetting {
  provider: string
  name: string
  type: 'auth' | 'payment'
  is_enabled: boolean
  allowed_user_types?: string[]
  config?: Record<string, any>
}

export const settingsApi = {
  async getSettings(): Promise<Record<string, any>> {
    try {
      return await request('/settings')
    } catch {
      return {
        business_name: 'Vinnyx Technologies',
        tagline: 'Cyber, Printing, Design & ICT Services',
        currency: 'KES',
        branch_name: 'Main Branch - Shop 01',
        branch_id: 1,
        phone: '+254 700 000 000',
        mpesa_till_number: '5421980',
        mpesa_paybill: '400200',
        mpesa_account: 'VINNYX',
        vat_rate: 0,
        receipt_footer: 'Thank you for choosing Vinnyx Technologies. Services once rendered are non-refundable.',
      }
    }
  },

  async updateSettings(data: Record<string, any>): Promise<Record<string, any>> {
    return request('/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async getAdminProviders(): Promise<ProviderSetting[]> {
    try {
      return await request('/admin/modules')
    } catch {
      return [
        { provider: 'password', name: 'Email/Phone & Password', type: 'auth', is_enabled: true, allowed_user_types: ['staff', 'customer'] },
        { provider: 'phone_otp', name: 'Phone OTP via SMS', type: 'auth', is_enabled: true, allowed_user_types: ['customer'] },
        { provider: 'google', name: 'Google Single Sign-On', type: 'auth', is_enabled: true, allowed_user_types: ['customer'] },
        { provider: 'apple', name: 'Sign in with Apple', type: 'auth', is_enabled: true, allowed_user_types: ['customer'] },
        { provider: 'cash', name: 'Cash Gateway', type: 'payment', is_enabled: true },
        { provider: 'mpesa_manual', name: 'M-Pesa Manual Till Code Entry', type: 'payment', is_enabled: true },
        { provider: 'mpesa_stk', name: 'M-Pesa STK Push (Daraja)', type: 'payment', is_enabled: true },
        { provider: 'card', name: 'Card Gateway (Pesapal / Flutterwave)', type: 'payment', is_enabled: false },
        { provider: 'credit', name: 'Customer Credit Account', type: 'payment', is_enabled: true },
      ]
    }
  },

  async toggleProvider(provider: string, is_enabled: boolean): Promise<void> {
    try {
      await request(`/admin/auth-providers/${provider}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_enabled }),
      })
    } catch {
      // simulated success for frontend testing
    }
  },
}
