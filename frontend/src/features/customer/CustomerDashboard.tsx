import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { salesApi } from '@/api/sales'
import { repairsApi } from '@/api/repairs'
import { serviceRequestsApi } from '@/api/serviceRequests'
import type { Sale, RepairTicket, ServiceRequest } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatKES, formatDate } from '@/lib/utils'
import {
  ShoppingBag,
  Printer,
  MessageCircle,
  Plus,
  LogOut,
  Laptop,
  Wrench,
  Inbox,
} from 'lucide-react'

function normalizePhone(phone?: string | null): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('254') && digits.length === 12) {
    return '0' + digits.substring(3)
  }
  return digits
}

export const CustomerDashboard: React.FC = () => {
  const { user, logout } = useAuth()

  const [activeTab, setActiveTab] = useState<'orders' | 'repairs' | 'requests'>('orders')
  const [orders, setOrders] = useState<Sale[]>([])
  const [repairs, setRepairs] = useState<RepairTicket[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!user) return
    const userPhoneNorm = normalizePhone(user.phone)
    const userNameNorm = user.name?.trim().toLowerCase()

    setIsLoading(true)
    Promise.all([
      salesApi.getSales(),
      repairsApi.getTickets(),
      serviceRequestsApi.getRequests('all'),
    ])
      .then(([allSales, allRepairs, allRequests]) => {
        // Filter strictly by the logged-in customer's phone or name
        const mySales = (allSales || []).filter((s) => {
          if (userPhoneNorm && normalizePhone(s.customer_phone) === userPhoneNorm) return true
          if (userNameNorm && s.customer_name?.trim().toLowerCase() === userNameNorm) return true
          return false
        })

        const myRepairs = (allRepairs || []).filter((r) => {
          if (userPhoneNorm && normalizePhone(r.customer_phone) === userPhoneNorm) return true
          if (userNameNorm && r.customer_name?.trim().toLowerCase() === userNameNorm) return true
          return false
        })

        const myRequests = (allRequests || []).filter((req) => {
          if (userPhoneNorm && normalizePhone(req.customer_phone) === userPhoneNorm) return true
          if (userNameNorm && req.customer_name?.trim().toLowerCase() === userNameNorm) return true
          return false
        })

        setOrders(mySales)
        setRepairs(myRepairs)
        setRequests(myRequests)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Customer Header — white/blue theme */}
      <header className="bg-white border-b border-blue-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                VX
              </div>
              <span className="font-extrabold text-sm text-blue-950">Vinnyx Technologies</span>
              <Badge variant="info">Customer Portal</Badge>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/254750280280"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline"
            >
              <MessageCircle className="h-4 w-4" /> Help: 0750280280
            </a>

            <div className="flex items-center gap-2 text-xs border-l border-gray-200 pl-4">
              <div className="text-right hidden sm:block">
                <span className="font-bold text-gray-900 block">{user?.name}</span>
                <span className="text-[10px] text-gray-500">{user?.email || user?.phone}</span>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Welcome back, {user?.name}!</h2>
            <p className="text-xs text-gray-500 mt-1">
              Track your ongoing service requests, device repairs, and online shop orders from one place.
            </p>
          </div>

          <div className="flex gap-2">
            <Link to="/shop">
              <Button variant="outline" size="sm">
                <ShoppingBag className="h-4 w-4 mr-1.5" /> Visit Shop
              </Button>
            </Link>
            <Link to="/#request-service">
              <Button variant="primary" size="sm">
                <Plus className="h-4 w-4 mr-1.5" /> New Service Request
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-gray-200/70 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'orders' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Past Shop Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('repairs')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'repairs' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Device Repairs ({repairs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'requests' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Service Requests ({requests.length})
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-2xl border border-gray-200">
            Loading your account records...
          </div>
        ) : (
          <>
            {/* Tab Contents: Orders */}
            {activeTab === 'orders' && (
              <>
                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">No Past Orders Found</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      You haven't placed any stationery, electronics, or equipment orders under this account yet.
                    </p>
                    <div className="pt-2">
                      <Link to="/shop">
                        <Button variant="primary" size="sm">
                          <ShoppingBag className="h-4 w-4 mr-1.5" /> Browse Products in Shop
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Card className="shadow-xs">
                    <CardHeader className="py-3 px-4 border-b border-gray-100">
                      <CardTitle className="text-sm">Purchased Goods & Receipts</CardTitle>
                      <CardDescription>All electronics, paper, and cyber tools ordered online or in-store</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-gray-100">
                        {orders.map((ord) => (
                          <div key={ord.id} className="p-4 flex items-center justify-between text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{ord.sale_number}</span>
                                <Badge variant={ord.payment_status === 'paid' ? 'success' : 'warning'}>
                                  {ord.payment_status}
                                </Badge>
                              </div>
                              <p className="text-gray-700 font-medium mt-1">
                                {ord.items.map((it) => `${it.quantity}x ${it.service_name}`).join(', ')}
                              </p>
                              <span className="text-[10px] text-gray-400">
                                Date: {formatDate(ord.created_at)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-blue-700 block">
                                {formatKES(ord.total)}
                              </span>
                              <Button variant="ghost" size="sm" className="text-xs text-gray-500">
                                <Printer className="h-3 w-3 mr-1" /> View Receipt
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Tab Contents: Repairs */}
            {activeTab === 'repairs' && (
              <>
                {repairs.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <Wrench className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">No Active Repair Tickets</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      You have no laptops, desktops, or printers currently checked into our hardware repairs lab.
                    </p>
                    <div className="pt-2">
                      <Link to="/#request-service">
                        <Button variant="primary" size="sm">
                          <Plus className="h-4 w-4 mr-1.5" /> Book a Hardware Repair
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {repairs.map((rep) => (
                      <Card key={rep.id} className="p-5 border-blue-300 bg-white shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <Laptop className="h-4 w-4 text-blue-600" />
                              <span className="font-bold text-sm text-gray-900">
                                {rep.brand_model || rep.device_type}
                              </span>
                              <Badge variant={rep.status === 'ready_for_pickup' || rep.status === 'repaired' ? 'success' : 'info'}>
                                {rep.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <span className="text-xs font-mono text-gray-400">Ticket Ref: {rep.ticket_number}</span>
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            Received on {formatDate(rep.created_at)}
                          </span>
                        </div>

                        <div className="py-3 text-xs text-gray-700 space-y-1">
                          <p><strong className="text-gray-900">Reported Problem:</strong> {rep.reported_fault}</p>
                          {rep.diagnosis && (
                            <p className="text-blue-800 bg-blue-50 p-2 rounded-lg">
                              <strong>Technician Status:</strong> {rep.diagnosis}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                          <div>
                            <span>Total Repair Cost: <strong>{formatKES(rep.estimated_cost)}</strong></span>
                            <span className="ml-3 text-blue-700">Deposit Paid: <strong>{formatKES(rep.deposit_paid)}</strong></span>
                            <span className="ml-3 text-amber-700 font-bold">
                              Balance on Pickup: <strong>{formatKES(Math.max(0, rep.estimated_cost - rep.deposit_paid))}</strong>
                            </span>
                          </div>

                          <a
                            href={`https://wa.me/254750280280?text=${encodeURIComponent(
                              `Hello Vinnyx, I am inquiring about my repair ticket ${rep.ticket_number}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
                          >
                            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Support
                          </a>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Tab Contents: Requests */}
            {activeTab === 'requests' && (
              <>
                {requests.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <Inbox className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">No Service Requests</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      Need help with government portals (KRA, NTSA, HELB), printing, typesetting, or design? Submit a request and our on-duty tellers will attend to it.
                    </p>
                    <div className="pt-2">
                      <Link to="/#request-service">
                        <Button variant="primary" size="sm">
                          <Plus className="h-4 w-4 mr-1.5" /> Submit New Service Request
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Card className="shadow-xs">
                    <CardHeader className="py-3 px-4 border-b border-gray-100">
                      <CardTitle className="text-sm">Active Service Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-gray-100">
                        {requests.map((req) => (
                          <div key={req.id} className="p-4 flex items-center justify-between text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 font-mono">{req.request_number}</span>
                                <Badge variant={req.status === 'completed' ? 'success' : 'info'}>
                                  {req.status}
                                </Badge>
                              </div>
                              <span className="text-[11px] font-semibold text-blue-700 block mt-0.5 capitalize">
                                {req.service_category.replace('_', ' ')}
                              </span>
                              <p className="text-gray-600 mt-1">{req.description}</p>
                              <span className="text-[10px] text-gray-400">
                                Assigned: {req.assigned_teller_name || 'In Queue'} • Date: {formatDate(req.created_at)}
                              </span>
                            </div>

                            <a
                              href={`https://wa.me/254750280280?text=${encodeURIComponent(
                                `Hello, checking status of service request ${req.request_number}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1 font-semibold"
                            >
                              <MessageCircle className="h-3 w-3 text-blue-600" /> Follow up
                            </a>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Customer Portal Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>&copy; 2026 Vinnyx Technologies. Bomet CBD, Opposite Aga Khan Hospital • WhatsApp: 0750280280</span>
          <span>
            Designed by{' '}
            <a
              href="https://techrift-system.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
            >
              Techrift Software
            </a>
          </span>
        </div>
      </footer>
    </div>
  )
}
