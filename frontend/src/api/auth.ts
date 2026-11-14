import { request } from './client'
import type { AuthProviderInfo, User } from '@/types'

// Default fallback providers when backend is starting or offline
export const FALLBACK_PROVIDERS: AuthProviderInfo[] = [
  {
    key: 'password',
    name: 'Password (Email/Phone)',
    is_enabled: true,
    allowed_user_types: ['staff', 'customer'],
    description: 'Sign in with registered credentials',
  },
  {
    key: 'phone_otp',
    name: 'Phone OTP',
    is_enabled: true,
    allowed_user_types: ['customer'],
    description: 'Receive a single-use verification code via SMS',
  },
  {
    key: 'google',
    name: 'Google',
    is_enabled: true,
    allowed_user_types: ['customer'],
    description: 'Sign in with your Google Workspace / Gmail account',
  },
  {
    key: 'apple',
    name: 'Apple',
    is_enabled: true,
    allowed_user_types: ['customer'],
    description: 'Sign in with Apple ID',
  },
]

export const authApi = {
  async getProviders(): Promise<AuthProviderInfo[]> {
    try {
      const data = await request<AuthProviderInfo[]>('/auth/providers')
      return Array.isArray(data) ? data : (data as any)?.providers || FALLBACK_PROVIDERS
    } catch {
      // Fallback gracefully so frontend login works standalone
      return FALLBACK_PROVIDERS
    }
  },

  async loginPassword(identifier: string, password: string): Promise<{ token: string; user: User }> {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    })
  },

  async register(data: { name: string; phone?: string; email?: string; password: string }): Promise<{ token: string; user: User }> {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        password_confirmation: data.password,
      }),
    })
  },

  async requestOtp(phone: string, purpose: 'login' | 'register' | 'recovery' = 'login') {
    return request('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone, purpose }),
    })
  },

  async verifyOtp(phone: string, code: string): Promise<{ token: string; user: User }> {
    return await request('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    })
  },

  async loginSocial(provider: string, tokenOrCode: string): Promise<{ token: string; user: User }> {
    return request(`/auth/social/${provider}`, {
      method: 'POST',
      body: JSON.stringify({ token: tokenOrCode }),
    })
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me')
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('vinnyx_token')
      localStorage.removeItem('vinnyx_user')
    }
  },
}
