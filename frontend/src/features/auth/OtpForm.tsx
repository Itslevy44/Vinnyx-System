import React, { useState, useEffect } from 'react'
import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Smartphone, CheckCircle2 } from 'lucide-react'

interface OtpFormProps {
  onSuccess: (user: any) => void
  onCancel?: () => void
}

export const OtpForm: React.FC<OtpFormProps> = ({ onSuccess, onCancel }) => {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let timer: any
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || phone.length < 9) {
      setError('Please enter a valid phone number (e.g. 0712345678 or +254712345678)')
      return
    }

    setError(null)
    setLoading(true)
    try {
      await authApi.requestOtp(phone, 'login')
      setStep('verify')
      setCountdown(60)
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || code.length < 4) {
      setError('Please enter the verification code sent to your phone.')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const res = await authApi.verifyOtp(phone, code)
      onSuccess(res.user)
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired OTP code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {step === 'request' ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <Input
            label="Mobile Phone Number"
            type="tel"
            placeholder="0712 345 678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Smartphone className="h-4 w-4" />}
            helperText="We will send a short-lived SMS verification code"
            required
          />
          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Back
              </Button>
            )}
            <Button type="submit" isLoading={loading} className="flex-1">
              Send SMS Code
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            SMS code sent to <strong className="text-gray-900">{phone}</strong>.
            <button
              type="button"
              onClick={() => setStep('request')}
              className="ml-2 text-blue-600 underline font-medium cursor-pointer"
            >
              Change
            </button>
          </div>

          <Input
            label="6-Digit Verification Code"
            type="text"
            placeholder="123456"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.trim())}
            icon={<CheckCircle2 className="h-4 w-4" />}
            required
          />

          <div className="text-xs text-gray-500 flex justify-between items-center">
            {countdown > 0 ? (
              <span>Resend code in {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleSendCode}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Resend SMS code
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep('request')} className="flex-1">
              Back
            </Button>
            <Button type="submit" isLoading={loading} className="flex-1">
              Verify & Sign In
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
