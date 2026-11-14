import React, { useState, useEffect } from 'react'
import { settingsApi } from '@/api/settings'
import type { ProviderSetting } from '@/api/settings'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ReviewQueue } from '@/features/payments/ReviewQueue'
import { LinkAccounts } from '@/features/auth/LinkAccounts'
import { Sliders, CheckCircle2, Building, KeyRound, CreditCard } from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const { user, hasRole } = useAuth()
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [providers, setProviders] = useState<ProviderSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([settingsApi.getSettings(), settingsApi.getAdminProviders()]).then(
      ([s, p]) => {
        setSettings(s)
        setProviders(p)
        setLoading(false)
      }
    )
  }, [])

  const handleToggleProvider = async (providerKey: string, currentVal: boolean) => {
    if (!hasRole('owner')) {
      alert('Only the System Owner can enable or disable swappable providers.')
      return
    }

    const newVal = !currentVal
    await settingsApi.toggleProvider(providerKey, newVal)
    setProviders((prev) =>
      prev.map((item) =>
        item.provider === providerKey ? { ...item, is_enabled: newVal } : item
      )
    )
    setSavedMessage(`Updated ${providerKey} status. Changes reflect dynamically across the system.`)
    setTimeout(() => setSavedMessage(null), 3000)
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasRole('owner', 'manager')) {
      alert('Only Owner or Manager can modify business settings.')
      return
    }
    await settingsApi.updateSettings(settings)
    setSavedMessage('Business settings saved successfully!')
    setTimeout(() => setSavedMessage(null), 3000)
  }

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-500">Loading system settings...</div>
  }

  const authProviders = providers.filter((p) => p.type === 'auth')
  const paymentProviders = providers.filter((p) => p.type === 'payment')

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">System Settings & Providers</h1>
            <p className="text-xs text-gray-500">
              Manage modular swappable drivers, feature flags, till identifiers, and receipts.
            </p>
          </div>

          <Badge variant={hasRole('owner') ? 'success' : 'neutral'}>
            Role: {user?.role.toUpperCase()}
          </Badge>
        </div>

        {savedMessage && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
            <span>{savedMessage}</span>
          </div>
        )}

        {/* SWAPPABLE PROVIDERS REGISTRY (Guideline Section 1 & 6) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sliders className="h-4 w-4 text-blue-600" />
              Swappable Providers & Drivers (Live Toggle)
            </CardTitle>
            <CardDescription>
              Enabling or disabling a provider updates both backend API resolution and frontend buttons without code rebuilds.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Authentication Providers */}
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-gray-500" /> Authentication Drivers
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {authProviders.map((prov) => (
                  <div
                    key={prov.provider}
                    className="p-3 rounded-xl border border-gray-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-gray-900">{prov.name}</span>
                        <Badge variant={prov.is_enabled ? 'success' : 'neutral'}>
                          {prov.is_enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        Allowed for: {prov.allowed_user_types?.join(', ') || 'all'}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!hasRole('owner')}
                      onClick={() => handleToggleProvider(prov.provider, prov.is_enabled)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        prov.is_enabled ? 'bg-blue-600' : 'bg-gray-200'
                      } ${!hasRole('owner') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          prov.is_enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Providers */}
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-gray-500" /> Payment Drivers (Gateways)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentProviders.map((prov) => (
                  <div
                    key={prov.provider}
                    className="p-3 rounded-xl border border-gray-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-gray-900">{prov.name}</span>
                        <Badge variant={prov.is_enabled ? 'success' : 'neutral'}>
                          {prov.is_enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">
                        Key: {prov.provider}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!hasRole('owner')}
                      onClick={() => handleToggleProvider(prov.provider, prov.is_enabled)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        prov.is_enabled ? 'bg-blue-600' : 'bg-gray-200'
                      } ${!hasRole('owner') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          prov.is_enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business and Till Config */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-600" />
              Shop & Receipt Configuration
            </CardTitle>
            <CardDescription>
              Receipt headers, M-Pesa till numbers and business metadata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Business Name"
                  value={settings.business_name || ''}
                  onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                  disabled={!hasRole('owner', 'manager')}
                />

                <Input
                  label="Branch Name"
                  value={settings.branch_name || ''}
                  onChange={(e) => setSettings({ ...settings, branch_name: e.target.value })}
                  disabled={!hasRole('owner', 'manager')}
                />

                <Input
                  label="M-Pesa Buy Goods Till Number"
                  value={settings.mpesa_till_number || ''}
                  onChange={(e) => setSettings({ ...settings, mpesa_till_number: e.target.value })}
                  disabled={!hasRole('owner', 'manager')}
                />

                <Input
                  label="M-Pesa Paybill / Account"
                  value={settings.mpesa_paybill || ''}
                  onChange={(e) => setSettings({ ...settings, mpesa_paybill: e.target.value })}
                  disabled={!hasRole('owner', 'manager')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Receipt Footer Disclaimer
                </label>
                <textarea
                  rows={2}
                  value={settings.receipt_footer || ''}
                  onChange={(e) => setSettings({ ...settings, receipt_footer: e.target.value })}
                  disabled={!hasRole('owner', 'manager')}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {hasRole('owner', 'manager') && (
                <div className="flex justify-end">
                  <Button type="submit">Save Business Settings</Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Manager Payment Review Queue */}
        <ReviewQueue />

        {/* Profile Sign-in Identities Linking */}
        <LinkAccounts />
      </div>
    </div>
  )
}
