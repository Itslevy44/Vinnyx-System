import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { KeyRound, Smartphone, Trash2, Plus, ShieldCheck, Globe } from 'lucide-react'

interface LinkedIdentity {
  id: string
  provider: string
  identifier: string
  linked_at: string
  last_used_at?: string
}

export const LinkAccounts: React.FC = () => {
  const [identities, setIdentities] = useState<LinkedIdentity[]>([
    {
      id: 'id-1',
      provider: 'password',
      identifier: 'owner@vinnyx.co.ke',
      linked_at: new Date(Date.now() - 3600000 * 240).toISOString(),
      last_used_at: new Date().toISOString(),
    },
    {
      id: 'id-2',
      provider: 'phone_otp',
      identifier: '+254712345678',
      linked_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      last_used_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ])

  const [message, setMessage] = useState<string | null>(null)

  const handleUnlink = (id: string) => {
    // Guideline 2.6: User tries to remove their last sign-in method -> Blocked
    if (identities.length <= 1) {
      alert('Action blocked: You cannot unlink your last remaining sign-in method.')
      return
    }

    setIdentities((prev) => prev.filter((i) => i.id !== id))
    setMessage('Sign-in identity unlinked successfully.')
    setTimeout(() => setMessage(null), 3000)
  }

  const handleLinkNew = (provider: string) => {
    const newId: LinkedIdentity = {
      id: 'id-' + Date.now(),
      provider,
      identifier: `user_${provider}@account.com`,
      linked_at: new Date().toISOString(),
    }
    setIdentities([...identities, newId])
    setMessage(`Successfully linked ${provider.toUpperCase()} identity to your account.`)
    setTimeout(() => setMessage(null), 3000)
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'password':
        return <KeyRound className="h-4 w-4 text-blue-600" />
      case 'phone_otp':
        return <Smartphone className="h-4 w-4 text-sky-600" />
      default:
        return <Globe className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          Linked Sign-In Identities
        </CardTitle>
        <CardDescription>
          One account can be accessed through multiple credentials (Password, Phone SMS OTP, Google, Apple)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg">
            {message}
          </div>
        )}

        <div className="space-y-2.5">
          {identities.map((id) => (
            <div
              key={id.id}
              className="p-3 rounded-xl border border-gray-200 bg-white flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">{getProviderIcon(id.provider)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 capitalize">
                      {id.provider.replace('_', ' ')}
                    </span>
                    <Badge variant="success">Verified</Badge>
                  </div>
                  <span className="text-gray-600 font-mono text-[11px] block mt-0.5">
                    {id.identifier}
                  </span>
                  <span className="text-[10px] text-gray-400 block">
                    Linked: {formatDate(id.linked_at)}
                  </span>
                </div>
              </div>

              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnlink(id.id)}
                  className="text-rose-600 hover:bg-rose-50"
                  title="Unlink identity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLinkNew('google')}
          >
            <Plus className="h-3 w-3 mr-1" /> Link Google Account
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLinkNew('apple')}
          >
            <Plus className="h-3 w-3 mr-1" /> Link Apple ID
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
