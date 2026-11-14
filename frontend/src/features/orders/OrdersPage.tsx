import React, { useState, useEffect } from 'react'
import { ordersApi } from '@/api/orders'
import type { CustomerOrder } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { formatKES, formatDate } from '@/lib/utils'
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Send,
  User,
  Phone,
} from 'lucide-react'

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // New order form
  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service_type: 'Bulk Printing & Binding',
    description: '',
    quoted_amount: 0,
    deposit_paid: 0,
    balance: 0,
    status: 'pending' as CustomerOrder['status'],
  })

  useEffect(() => {
    ordersApi.getOrders().then(setOrders)
  }, [])

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    const matchesQuery =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search) ||
      o.service_type.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesQuery
  })

  const getStatusBadge = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'in_progress':
        return <Badge variant="info">In Progress</Badge>
      case 'ready':
        return <Badge variant="success">Ready for Collection</Badge>
      case 'completed':
        return <Badge variant="neutral">Completed</Badge>
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrder.customer_name || !newOrder.customer_phone || newOrder.quoted_amount <= 0) {
      alert('Please fill out customer details and quoted amount.')
      return
    }

    setLoading(true)
    try {
      const balance = Math.max(0, newOrder.quoted_amount - newOrder.deposit_paid)
      const created = await ordersApi.createOrder({
        ...newOrder,
        balance,
      })
      setOrders([created, ...orders])
      setIsAddOpen(false)
      setNewOrder({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        service_type: 'Bulk Printing & Binding',
        description: '',
        quoted_amount: 0,
        deposit_paid: 0,
        balance: 0,
        status: 'pending',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, nextStatus: CustomerOrder['status']) => {
    const updated = await ordersApi.updateStatus(id, nextStatus)
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>Customer Print & Design Orders</span>
              <Badge variant="info">
                {orders.filter((o) => o.status !== 'completed').length} Active Orders
              </Badge>
            </h1>
            <p className="text-xs text-gray-500">
              Exam booklets, eulogy programs, flyers, graphic design, and document printing jobs.
            </p>
          </div>

          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> New Service Job
          </Button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order #, customer, phone, or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'pending', 'in_progress', 'ready', 'completed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-4 bg-white flex flex-col justify-between hover:border-gray-300 transition-all shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs text-gray-900">
                    {order.order_number}
                  </span>
                  {getStatusBadge(order.status)}
                </div>

                <div className="space-y-1.5 border-b border-gray-100 pb-3">
                  <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>{order.service_type}</span>
                  </h4>

                  <div className="text-xs text-gray-600">
                    Customer: <strong className="text-gray-900">{order.customer_name}</strong> • {order.customer_phone}
                  </div>

                  <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg line-clamp-2">
                    {order.description}
                  </p>
                </div>

                <div className="py-2.5 text-xs grid grid-cols-2 gap-2 text-gray-500">
                  <div>
                    <span>Quoted: </span>
                    <strong className="text-gray-900">{formatKES(order.quoted_amount)}</strong>
                  </div>
                  <div>
                    <span>Deposit: </span>
                    <strong className="text-blue-600">{formatKES(order.deposit_paid)}</strong>
                  </div>
                  <div>
                    <span>Date: </span>
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                  <div>
                    <span>Balance: </span>
                    <strong className={order.balance > 0 ? 'text-amber-600' : 'text-green-600'}>
                      {formatKES(order.balance)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-1.5">
                {order.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                  >
                    Start Production
                  </Button>
                )}

                {order.status === 'in_progress' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleUpdateStatus(order.id, 'ready')}
                  >
                    <Send className="h-3 w-3 mr-1" /> Mark Ready (Notify)
                  </Button>
                )}

                {order.status === 'ready' && (
                  <Button
                    variant="success"
                    size="sm"
                    className="w-full"
                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Collected & Paid
                  </Button>
                )}

                {order.status === 'completed' && (
                  <span className="text-[11px] text-gray-400 py-1 text-center w-full">
                    Completed & Archived
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* New Service Job Dialog */}
        <Dialog
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Create Custom Service Job"
          description="Register custom print runs, design jobs, and take advance customer deposits"
          maxWidth="md"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Customer Full Name"
                placeholder="e.g. St. Mary School"
                value={newOrder.customer_name}
                onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })}
                icon={<User className="h-4 w-4" />}
                required
              />

              <Input
                label="Customer Mobile Phone"
                type="tel"
                placeholder="0712 000 000"
                value={newOrder.customer_phone}
                onChange={(e) => setNewOrder({ ...newOrder, customer_phone: e.target.value })}
                icon={<Phone className="h-4 w-4" />}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Job Category / Service Type
              </label>
              <select
                value={newOrder.service_type}
                onChange={(e) => setNewOrder({ ...newOrder, service_type: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="Bulk Printing & Binding">Bulk Printing & Binding</option>
                <option value="Eulogy Program Graphic Design & Print">Eulogy Program Graphic Design & Print</option>
                <option value="Flyers & Posters">Flyers & Posters (A4/A3 Full Color)</option>
                <option value="Company Profile & Business Cards">Company Profile & Business Cards</option>
                <option value="Custom Graphic Design">Custom Graphic Design & Vector Artwork</option>
                <option value="Large Format PVC Banner">Large Format PVC Banner</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Job Specifications / Notes
              </label>
              <textarea
                rows={3}
                value={newOrder.description}
                onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                placeholder="Specify paper type (e.g. 150gsm gloss), quantity, stapling/binding, and design instructions..."
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Total Quoted Price (KES)"
                type="number"
                min="1"
                value={newOrder.quoted_amount || ''}
                onChange={(e) => setNewOrder({ ...newOrder, quoted_amount: Number(e.target.value) })}
                required
              />

              <Input
                label="Advance Deposit Collected (KES)"
                type="number"
                min="0"
                value={newOrder.deposit_paid || ''}
                onChange={(e) => setNewOrder({ ...newOrder, deposit_paid: Number(e.target.value) })}
                helperText={`Balance remaining: ${formatKES(Math.max(0, newOrder.quoted_amount - newOrder.deposit_paid))}`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={loading}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Create Service Order
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </div>
  )
}
