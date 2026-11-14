import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { RoleGuard } from './RoleGuard'
import { LandingPage } from '@/features/landing/LandingPage'
import { ShopPage } from '@/features/shop/ShopPage'
import { CustomerDashboard } from '@/features/customer/CustomerDashboard'
import { LoginPage } from '@/features/auth/LoginPage'
import { PosPage } from '@/features/sales/PosPage'
import { ElectronicsPosPage } from '@/features/sales/ElectronicsPosPage'
import { TellerDashboard } from '@/features/teller/TellerDashboard'
import { InventoryPage } from '@/features/inventory/InventoryPage'
import { RepairsPage } from '@/features/repairs/RepairsPage'
import { OrdersPage } from '@/features/orders/OrdersPage'
import { ExpensesPage } from '@/features/expenses/ExpensesPage'
import { DayClosePage } from '@/features/dayclose/DayClosePage'
import { PayrollPage } from '@/features/payroll/PayrollPage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { AuditLogPage } from '@/features/audit/AuditLogPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Page (System Entry Point) */}
      <Route path="/" element={<LandingPage />} />

      {/* Customer Facing Online Shop */}
      <Route path="/shop" element={<ShopPage />} />

      {/* Authentication */}
      <Route path="/login" element={<LoginPage />} />

      {/* Customer Dedicated Portal */}
      {/* Customer Dedicated Portal (Customers only) */}
      <Route
        path="/customer/dashboard"
        element={
          <RoleGuard allowedRoles={['customer']}>
            <CustomerDashboard />
          </RoleGuard>
        }
      />

      {/* Staff Back-Office Layout with Responsive Sidebar */}
      <Route
        element={
          <RoleGuard allowedRoles={['teller', 'repair_teller', 'manager', 'owner']}>
            <AppLayout />
          </RoleGuard>
        }
      >
        {/* Regular Teller Station: My Earnings & Service Requests Only */}
        <Route
          path="teller/dashboard"
          element={
            <RoleGuard allowedRoles={['teller', 'manager', 'owner']}>
              <TellerDashboard />
            </RoleGuard>
          }
        />

        {/* Stationery & Cyber Services POS (Manager & Owner only: manager records sales and assigns commissions) */}
        <Route
          path="pos"
          element={
            <RoleGuard allowedRoles={['manager', 'owner']}>
              <PosPage />
            </RoleGuard>
          }
        />

        {/* Electronics & Hardware POS (Teller 10 & 11, Manager, Owner) */}
        <Route
          path="electronics-pos"
          element={
            <RoleGuard allowedRoles={['repair_teller', 'manager', 'owner']}>
              <ElectronicsPosPage />
            </RoleGuard>
          }
        />

        {/* Hardware Repairs Lab (Teller 10 & 11, Manager, Owner) */}
        <Route
          path="repairs"
          element={
            <RoleGuard allowedRoles={['repair_teller', 'manager', 'owner']}>
              <RepairsPage />
            </RoleGuard>
          }
        />

        {/* Inventory, Orders, Expenses, Day Close */}
        <Route
          path="inventory"
          element={
            <RoleGuard allowedRoles={['manager', 'owner']}>
              <InventoryPage />
            </RoleGuard>
          }
        />
        <Route
          path="orders"
          element={
            <RoleGuard allowedRoles={['teller', 'repair_teller', 'manager', 'owner']}>
              <OrdersPage />
            </RoleGuard>
          }
        />
        <Route
          path="expenses"
          element={
            <RoleGuard allowedRoles={['teller', 'repair_teller', 'manager', 'owner']}>
              <ExpensesPage />
            </RoleGuard>
          }
        />
        <Route
          path="day-close"
          element={
            <RoleGuard allowedRoles={['manager', 'owner']}>
              <DayClosePage />
            </RoleGuard>
          }
        />

        {/* Manager & Owner Only Modules */}
        <Route
          path="payroll"
          element={
            <RoleGuard allowedRoles={['manager', 'owner']}>
              <PayrollPage />
            </RoleGuard>
          }
        />
        <Route
          path="reports"
          element={
            <RoleGuard allowedRoles={['manager', 'owner']}>
              <ReportsPage />
            </RoleGuard>
          }
        />
        <Route
          path="audit"
          element={
            <RoleGuard allowedRoles={['manager', 'owner']}>
              <AuditLogPage />
            </RoleGuard>
          }
        />
        <Route
          path="settings"
          element={
            <RoleGuard allowedRoles={['manager', 'owner']}>
              <SettingsPage />
            </RoleGuard>
          }
        />
      </Route>

      {/* Catch-all redirect to Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
