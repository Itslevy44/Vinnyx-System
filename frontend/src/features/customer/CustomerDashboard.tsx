import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
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
} from 'lucide-react'

export const CustomerDashboard: React.FC = () => {
  const { user, logout } = useAuth()

  const [activeTab, setActiveTab] = useState<'orders' | 'repairs' | 'requests'>('orders')

  const mockPastOrders = [
    {
      id: 'ord-901',
      date: '2026-11-10T14:30:00.000Z',
      items: '3x Chamex A4 Paper Ream, 1x SanDisk 64GB Flash Drive',
      total: 3200,
      status: 'completed',
      receiptRef: 'VX-109281',
    },
    {
      id: 'ord-880',
      date: '2026-10-25T11:15:00.000Z',
      items: '50x Color Printing, 1x Spiral Binding',
      total: 1600,
      status: 'completed',
      receiptRef: 'VX-098421',
    },
  ]

  const mockRepairs = [
    {
      ticketNo: 'REP-2026-089',
      device: 'HP ProBook 450 G5',
      fault: 'Overheating & fan rattling noise',
      status: 'ready_for_pickup',
      estimatedCost: 2500,
      deposit: 1000,
      date: '2026-11-13T09:00:00.000Z',
    },
  ]

  const mockRequests = [
    {
      ref: 'REQ-2026-901',
      category: 'Government Cyber',
      desc: 'KRA PIN retrieval and tax clearance application',
      status: 'in_progress',
      assignedTo: 'Jane (Teller #01)',
      date: '2026-11-14T08:30:00.000Z',
    },
  ]

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
            Past Shop Orders ({mockPastOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('repairs')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'repairs' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Device Repairs ({mockRepairs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'requests' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Service Requests ({mockRequests.length})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'orders' && (
          <Card className="shadow-xs">
            <CardHeader className="py-3 px-4 border-b border-gray-100">
              <CardTitle className="text-sm">Purchased Goods & Receipts</CardTitle>
              <CardDescription>All electronics, paper, and cyber tools ordered online or in-store</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {mockPastOrders.map((ord) => (
                  <div key={ord.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{ord.id.toUpperCase()}</span>
                        <Badge variant="success">{ord.status}</Badge>
                      </div>
                      <p className="text-gray-700 font-medium mt-1">{ord.items}</p>
                      <span className="text-[10px] text-gray-400">
                        Date: {formatDate(ord.date)} • Receipt: {ord.receiptRef}
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

        {activeTab === 'repairs' && (
          <div className="space-y-4">
            {mockRepairs.map((rep) => (
              <Card key={rep.ticketNo} className="p-5 border-blue-300 bg-white shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Laptop className="h-4 w-4 text-blue-600" />
                      <span className="font-bold text-sm text-gray-900">{rep.device}</span>
                      <Badge variant="success">Ready for Collection</Badge>
                    </div>
                    <span className="text-xs font-mono text-gray-400">Ticket Ref: {rep.ticketNo}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    Received on {formatDate(rep.date)}
                  </span>
                </div>

                <div className="py-3 text-xs text-gray-700 space-y-1">
                  <p><strong className="text-gray-900">Reported Problem:</strong> {rep.fault}</p>
                  <p className="text-blue-800 bg-blue-50 p-2 rounded-lg">
                    <strong>Technician Status:</strong> Repair complete & all hardware diagnostics verified. Your device is ready at the repair desk (Tellers 10 & 11).
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span>Total Repair Cost: <strong>{formatKES(rep.estimatedCost)}</strong></span>
                    <span className="ml-3 text-blue-700">Deposit Paid: <strong>{formatKES(rep.deposit)}</strong></span>
                    <span className="ml-3 text-amber-700 font-bold">
                      Balance on Pickup: <strong>{formatKES(rep.estimatedCost - rep.deposit)}</strong>
                    </span>
                  </div>

                  <a
                    href={`https://wa.me/254750280280?text=Hello%20Vinnyx,%20I%20am%20inquiring%20about%20my%20repair%20${rep.ticketNo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Support
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'requests' && (
          <Card className="shadow-xs">
            <CardHeader className="py-3 px-4 border-b border-gray-100">
              <CardTitle className="text-sm">Active Service Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {mockRequests.map((req) => (
                  <div key={req.ref} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 font-mono">{req.ref}</span>
                        <Badge variant="info">{req.status}</Badge>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-700 block mt-0.5">
                        {req.category}
                      </span>
                      <p className="text-gray-600 mt-1">{req.desc}</p>
                      <span className="text-[10px] text-gray-400">
                        Assigned Teller: {req.assignedTo} • Date: {formatDate(req.date)}
                      </span>
                    </div>

                    <a
                      href={`https://wa.me/254750280280?text=Hello,%20checking%20status%20of%20${req.ref}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                    >
                      <MessageCircle className="h-3 w-3 text-blue-600" /> Follow up
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
