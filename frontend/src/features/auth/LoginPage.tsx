import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '@/api/auth'
import type { AuthProviderInfo } from '@/types'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { ProviderButtons } from './ProviderButtons'
import { OtpForm } from './OtpForm'
import {
  Lock,
  Mail,
  ShieldAlert,
  Building2,
  ArrowLeft,
  MessageCircle,
  UserPlus,
} from 'lucide-react'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { loginWithPassword, registerCustomer } = useAuth()

  const [providers, setProviders] = useState<AuthProviderInfo[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('password')
  const [userType, setUserType] = useState<'staff' | 'customer'>('staff')
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false)

  // Customer registration fields
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')

  // Form fields
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    authApi.getProviders().then((list) => {
      setProviders(list)
    })
  }, [])

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const loggedUser = await loginWithPassword(identifier.trim(), password)
      if (loggedUser.role === 'customer') {
        navigate('/customer/dashboard')
      } else if (loggedUser.role === 'teller') {
        navigate('/teller/dashboard')
      } else if (loggedUser.role === 'repair_teller') {
        navigate('/repairs')
      } else {
        navigate('/pos')
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid login credentials. Please verify your details and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regName.trim() || !regPhone.trim() || !password) {
      setError('Please provide your name, phone number, and password.')
      return
    }

    setIsLoading(true)
    try {
      await registerCustomer({
        name: regName.trim(),
        phone: regPhone.trim(),
        password,
      })
      navigate('/customer/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialClick = (providerKey: string) => {
    if (userType === 'staff') {
      setError(
        'Staff authentication is restricted. Pre-approved staff emails configured by the administrator can sign in with ' +
          providerKey.toUpperCase() +
          '.'
      )
      return
    }
    setError(null)
    alert(`Connecting to ${providerKey} authentication...`)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Landing Page
        </Link>

        <div className="mx-auto inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mb-3 shadow-sm">
          <Building2 className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Vinnyx Technologies</h2>
        <p className="mt-1 text-xs text-slate-600">Point of Sale, Repairs & Customer Portal</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-gray-200 shadow-xl bg-white rounded-2xl">
          <CardHeader className="pb-3 border-b border-gray-100">
            {/* Audience Tabs: Staff vs Customer */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setUserType('staff')
                  setIsRegisterMode(false)
                  setSelectedProvider('password')
                  setIdentifier('')
                  setPassword('')
                  setError(null)
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  userType === 'staff'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Staff Terminal
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserType('customer')
                  setIdentifier('')
                  setPassword('')
                  setError(null)
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  userType === 'customer'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Customer Portal
              </button>
            </div>

            {userType === 'customer' && (
              <div className="flex justify-center gap-4 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className={`font-bold transition-colors ${
                    !isRegisterMode ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className={`font-bold transition-colors ${
                    isRegisterMode ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Create New Account
                </button>
              </div>
            )}

            <CardTitle className="pt-2 text-base text-gray-900">
              {userType === 'staff'
                ? 'Sign in to Terminal Station'
                : isRegisterMode
                ? 'Register Customer Account'
                : 'Customer Account Login'}
            </CardTitle>
            <CardDescription className="text-gray-500">
              {userType === 'staff'
                ? 'Authorized tellers, repair technicians, and managers'
                : 'Track your print jobs, repair tickets, and past receipts'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {/* Swappable provider buttons */}
            {!isRegisterMode && (
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Authentication Method
                </label>
                <ProviderButtons
                  providers={providers}
                  selectedProvider={selectedProvider}
                  onSelectProvider={(key) => {
                    setSelectedProvider(key)
                    setError(null)
                    if (key === 'google' || key === 'apple') {
                      handleSocialClick(key)
                    }
                  }}
                  userType={userType}
                />
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {isRegisterMode ? (
              /* Customer Registration Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-1">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="e.g. David Mutua"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="0712 345 678"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  helperText="Used for SMS alerts on repair & print status"
                  required
                />

                <Input
                  label="Create Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                  required
                />

                <Button type="submit" isLoading={isLoading} className="w-full font-bold">
                  <UserPlus className="h-4 w-4 mr-1.5" /> Register & Access Portal
                </Button>
              </form>
            ) : (
              <>
                {selectedProvider === 'password' && (
                  <form onSubmit={handlePasswordLogin} className="space-y-4 pt-1">
                    <Input
                      label="Email or Mobile Phone"
                      type="text"
                      placeholder="e.g. name@vinnyx.co.ke or 07..."
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      icon={<Mail className="h-4 w-4" />}
                      required
                    />

                    <Input
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      icon={<Lock className="h-4 w-4" />}
                      required
                    />

                    <Button type="submit" isLoading={isLoading} className="w-full font-bold">
                      Sign In
                    </Button>
                  </form>
                )}

                {selectedProvider === 'phone_otp' && (
                  <OtpForm
                    onSuccess={() => {
                      navigate(userType === 'staff' ? '/pos' : '/customer/dashboard')
                    }}
                    onCancel={() => setSelectedProvider('password')}
                  />
                )}
              </>
            )}

            {/* Assistance Section */}
            <div className="pt-2 text-center border-t border-gray-100">
              <a
                href="https://wa.me/254750280280"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Need assistance? WhatsApp 0750280280
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
