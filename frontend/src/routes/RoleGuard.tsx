import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import type { Role } from '@/types'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: Role[]
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xs text-gray-500">
        Authenticating session...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
        <h2 className="text-lg font-bold text-gray-900">Access Restricted</h2>
        <p className="text-xs text-gray-600 mt-1 max-w-sm">
          Your current role (<strong>{user.role}</strong>) does not have permission to view this section.
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Go Back
        </button>
      </div>
    )
  }

  return <>{children}</>
}
