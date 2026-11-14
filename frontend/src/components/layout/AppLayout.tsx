import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import {
  Monitor,
  Receipt,
  CalendarCheck2,
  Sliders,
  LogOut,
  Boxes,
  Wrench,
  FileText,
  Wallet,
  BarChart3,
  ShieldCheck,
  Cpu,
  Coins,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  MessageCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  name: string
  path: string
  icon: LucideIcon
  badge?: string
}

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // Define role-specific navigation menus
  const getNavItems = (): NavItem[] => {
    if (!user) return []

    if (user.role === 'repair_teller') {
      // Teller 10 & 11: Electronics POS and Hardware Repairs Lab ONLY
      return [
        { name: 'Repairs Lab', path: '/repairs', icon: Wrench, badge: 'Workshop' },
        { name: 'Electronics POS', path: '/electronics-pos', icon: Cpu, badge: 'Hardware' },
      ]
    }

    if (user.role === 'teller') {
      // Regular Cyber Tellers: Service Requests Queue & Personal Commission Dashboard ONLY
      // (Manager records the sales & commission; tellers view their earnings and attend to customer requests)
      return [
        { name: 'My Commission & Queue', path: '/teller/dashboard', icon: Coins, badge: 'Personal' },
      ]
    }

    // Owner and Manager: Full oversight
    return [
      { name: 'Stationery & Cyber POS', path: '/pos', icon: Monitor },
      { name: 'Electronics POS', path: '/electronics-pos', icon: Cpu },
      { name: 'Inventory Warehouse', path: '/inventory', icon: Boxes },
      { name: 'Repairs Section', path: '/repairs', icon: Wrench },
      { name: 'Service Orders', path: '/orders', icon: FileText },
      { name: 'Daily Expenses', path: '/expenses', icon: Receipt },
      { name: 'Day Close & Reconcile', path: '/day-close', icon: CalendarCheck2 },
      { name: 'Payroll & Commissions', path: '/payroll', icon: Wallet },
      { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
      { name: 'Audit Trail', path: '/audit', icon: ShieldCheck },
      { name: 'System Settings', path: '/settings', icon: Sliders },
    ]
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Modern Light Theme Sidebar with White and Blue */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-50 bg-white text-gray-800 border-r border-gray-200 flex flex-col transition-all duration-300 shadow-xs ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 bg-white">
          {!isCollapsed && (
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                VX
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-blue-950 block leading-tight">
                  Vinnyx Technologies
                </span>
                <span className="text-[10px] text-blue-600 font-semibold block uppercase">
                  Bomet CBD Station
                </span>
              </div>
            </Link>
          )}

          {isCollapsed && (
            <div className="mx-auto h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
              VX
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Station Banner */}
        {!isCollapsed && (
          <div className="p-3 border-b border-gray-100 bg-blue-50/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                {user?.role === 'repair_teller'
                  ? 'Hardware & Repairs Station'
                  : user?.role === 'teller'
                  ? 'Cyber & Service Station'
                  : 'Management Administration'}
              </span>
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
            </div>
            <span className="font-bold text-xs text-gray-900 block truncate mt-0.5">
              {user?.name}
            </span>
            <span className="text-[10px] text-gray-500 block">
              Opposite Aga Khan Hospital, Bomet
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold uppercase">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* External Quick Links (WhatsApp Desk & Landing Page) */}
        {!isCollapsed && (
          <div className="p-3 border-t border-gray-100 space-y-2 bg-gray-50/60">
            <a
              href="https://wa.me/254750280280"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-600" />
                <span>WhatsApp Help</span>
              </div>
              <span className="font-mono text-[10px]">0750280280</span>
            </a>

            <a
              href="https://techrift-system.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-2 py-1 text-[10px] text-gray-400 hover:text-blue-600 transition-colors font-medium"
            >
              <span>By Techrift Software</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* User Card & Sign Out */}
        <div className="p-3 border-t border-gray-200 bg-white flex items-center justify-between">
          {!isCollapsed && (
            <div className="truncate pr-2">
              <span className="font-bold text-xs text-gray-900 block truncate leading-tight">
                {user?.name}
              </span>
              <span className="text-[10px] text-blue-600 uppercase font-bold">
                {user?.role.replace('_', ' ')}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Header */}
        <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between md:hidden z-30">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          <span className="font-bold text-xs text-gray-900">
            Vinnyx Technologies ({user?.role.toUpperCase()})
          </span>

          <Link to="/" className="text-xs text-blue-600 font-bold">
            Home
          </Link>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
