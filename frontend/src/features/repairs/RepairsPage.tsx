import React, { useState, useEffect } from 'react'
import { repairsApi } from '@/api/repairs'
import type { RepairTicket, RepairStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { formatKES, formatDate } from '@/lib/utils'
import {
  Plus,
  Search,
  Printer,
  CheckCircle2,
  Clock,
  Laptop,
  CheckCircle,
} from 'lucide-react'

export const RepairsPage: React.FC = () => {
  const [tickets, setTickets] = useState<RepairTicket[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null)
  const [isSlipOpen, setIsSlipOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Status update modal
  const [updateModalTicket, setUpdateModalTicket] = useState<RepairTicket | null>(null)
  const [newStatus, setNewStatus] = useState<RepairStatus>('diagnosing')
  const [newDiagnosis, setNewDiagnosis] = useState('')
  const [newActualCost, setNewActualCost] = useState<number>(0)

  // New ticket state
  const [newTicket, setNewTicket] = useState({
    branch_id: 1,
    customer_name: '',
    customer_phone: '',
    device_type: 'Laptop',
    brand_model: '',
    serial_number: '',
    reported_fault: '',
    technician_name: 'Vincent (Owner)',
    estimated_cost: 0,
    actual_cost: 0,
    deposit_paid: 0,
    status: 'received' as RepairStatus,
  })

  useEffect(() => {
    repairsApi.getTickets().then(setTickets)
  }, [])

  const statuses: { value: string; label: string }[] = [
    { value: 'all', label: 'All Repairs' },
    { value: 'received', label: 'Received' },
    { value: 'diagnosing', label: 'Diagnosing' },
    { value: 'waiting_parts', label: 'Waiting Parts' },
    { value: 'repaired', label: 'Repaired' },
    { value: 'ready_for_pickup', label: 'Ready for Pickup' },
    { value: 'collected', label: 'Collected' },
  ]

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    const matchesQuery =
      t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      t.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      t.customer_phone.includes(search) ||
      t.brand_model.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesQuery
  })

  const getStatusBadge = (status: RepairStatus) => {
    switch (status) {
      case 'received':
        return <Badge variant="neutral">Received</Badge>
      case 'diagnosing':
        return <Badge variant="warning">Diagnosing</Badge>
      case 'waiting_parts':
        return <Badge variant="danger">Waiting Parts</Badge>
      case 'repaired':
        return <Badge variant="info">Repaired</Badge>
      case 'ready_for_pickup':
        return <Badge variant="success">Ready for Pickup</Badge>
      case 'collected':
        return <Badge variant="neutral">Collected</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTicket.customer_name || !newTicket.customer_phone || !newTicket.brand_model) {
      alert('Please fill out customer and device details.')
      return
    }

    setLoading(true)
    try {
      const created = await repairsApi.createTicket(newTicket)
      setTickets([created, ...tickets])
      setIsAddOpen(false)
      setSelectedTicket(created)
      setIsSlipOpen(true)
      setNewTicket({
        branch_id: 1,
        customer_name: '',
        customer_phone: '',
        device_type: 'Laptop',
        brand_model: '',
        serial_number: '',
        reported_fault: '',
        technician_name: 'Vincent (Owner)',
        estimated_cost: 0,
        actual_cost: 0,
        deposit_paid: 0,
        status: 'received',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!updateModalTicket) return
    setLoading(true)
    try {
      const updated = await repairsApi.updateStatus(
        updateModalTicket.id,
        newStatus,
        newDiagnosis || undefined,
        newActualCost || undefined
      )
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      setUpdateModalTicket(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>Hardware & Device Repairs</span>
              <Badge variant="info">{tickets.filter((t) => t.status !== 'collected').length} Active Jobs</Badge>
            </h1>
            <p className="text-xs text-gray-500">
              Laptops, desktops, printer servicing, diagnosis reports and collection slips.
            </p>
          </div>

          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Book In Device
          </Button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ticket #, customer name, phone, or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {statuses.map((st) => (
              <button
                key={st.value}
                type="button"
                onClick={() => setStatusFilter(st.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets.map((ticket) => {
            const balance = Math.max(0, (ticket.actual_cost || ticket.estimated_cost) - ticket.deposit_paid)
            return (
              <Card key={ticket.id} className="p-4 bg-white flex flex-col justify-between hover:border-gray-300 transition-all shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-gray-900">
                      {ticket.ticket_number}
                    </span>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <div className="space-y-1.5 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                      <Laptop className="h-4 w-4 text-blue-600" />
                      <span>{ticket.brand_model}</span>
                      <span className="text-[10px] text-gray-400 font-normal">({ticket.device_type})</span>
                    </div>

                    <div className="text-xs text-gray-600">
                      Customer: <strong className="text-gray-900">{ticket.customer_name}</strong> • {ticket.customer_phone}
                    </div>

                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg line-clamp-2">
                      <strong className="text-gray-700">Fault:</strong> {ticket.reported_fault}
                    </p>

                    {ticket.diagnosis && (
                      <p className="text-xs text-blue-800 bg-blue-50/70 p-2 rounded-lg line-clamp-2">
                        <strong className="text-blue-950">Diagnosis:</strong> {ticket.diagnosis}
                      </p>
                    )}
                  </div>

                  <div className="py-2.5 text-xs grid grid-cols-2 gap-2 text-gray-500">
                    <div>
                      <span>Est. Cost: </span>
                      <strong className="text-gray-900">{formatKES(ticket.estimated_cost)}</strong>
                    </div>
                    <div>
                      <span>Deposit: </span>
                      <strong className="text-blue-600">{formatKES(ticket.deposit_paid)}</strong>
                    </div>
                    <div>
                      <span>Technician: </span>
                      <span className="text-gray-700">{ticket.technician_name}</span>
                    </div>
                    <div>
                      <span>Balance Due: </span>
                      <strong className={balance > 0 ? 'text-amber-600' : 'text-green-600'}>
                        {formatKES(balance)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTicket(ticket)
                      setIsSlipOpen(true)
                    }}
                  >
                    <Printer className="h-3 w-3 mr-1" /> Slip
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setUpdateModalTicket(ticket)
                      setNewStatus(ticket.status)
                      setNewDiagnosis(ticket.diagnosis || '')
                      setNewActualCost(ticket.actual_cost || ticket.estimated_cost)
                    }}
                  >
                    <Clock className="h-3 w-3 mr-1" /> Update Status
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Book-in Device Dialog */}
        <Dialog
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Book In Device for Repair / Service"
          description="Record customer problem statement, take deposit, and issue an intake claim slip"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Customer Full Name"
                placeholder="e.g. Peter Kamau"
                value={newTicket.customer_name}
                onChange={(e) => setNewTicket({ ...newTicket, customer_name: e.target.value })}
                required
              />

              <Input
                label="Customer Phone (for SMS updates)"
                type="tel"
                placeholder="0722 000 000"
                value={newTicket.customer_phone}
                onChange={(e) => setNewTicket({ ...newTicket, customer_phone: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Device Type
                </label>
                <select
                  value={newTicket.device_type}
                  onChange={(e) => setNewTicket({ ...newTicket, device_type: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop CPU">Desktop CPU</option>
                  <option value="Printer">Printer / Copier</option>
                  <option value="Monitor">Monitor / Screen</option>
                  <option value="UPS / Power">UPS / Power Supply</option>
                  <option value="Other">Other Hardware</option>
                </select>
              </div>

              <Input
                label="Brand & Model"
                placeholder="e.g. HP ProBook 450 G5"
                value={newTicket.brand_model}
                onChange={(e) => setNewTicket({ ...newTicket, brand_model: e.target.value })}
                required
              />

              <Input
                label="Serial Number (Optional)"
                placeholder="e.g. 5CD9281KL"
                value={newTicket.serial_number}
                onChange={(e) => setNewTicket({ ...newTicket, serial_number: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Reported Fault / Problem Description
              </label>
              <textarea
                rows={2}
                value={newTicket.reported_fault}
                onChange={(e) => setNewTicket({ ...newTicket, reported_fault: e.target.value })}
                placeholder="e.g. Screen flickering when moved, battery not charging..."
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Estimated Repair Cost (KES)"
                type="number"
                min="0"
                value={newTicket.estimated_cost || ''}
                onChange={(e) => setNewTicket({ ...newTicket, estimated_cost: Number(e.target.value) })}
                required
              />

              <Input
                label="Initial Deposit Paid (KES)"
                type="number"
                min="0"
                value={newTicket.deposit_paid || ''}
                onChange={(e) => setNewTicket({ ...newTicket, deposit_paid: Number(e.target.value) })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={loading}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Issue Intake Slip
              </Button>
            </div>
          </form>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog
          isOpen={!!updateModalTicket}
          onClose={() => setUpdateModalTicket(null)}
          title={`Update Repair Status: ${updateModalTicket?.ticket_number}`}
          description={`Customer: ${updateModalTicket?.customer_name} • ${updateModalTicket?.brand_model}`}
          maxWidth="md"
        >
          {updateModalTicket && (
            <form onSubmit={handleStatusUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Lifecycle Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RepairStatus)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value="received">Received</option>
                  <option value="diagnosing">Diagnosing</option>
                  <option value="waiting_parts">Waiting for Spare Parts</option>
                  <option value="repaired">Repaired & Testing Passed</option>
                  <option value="ready_for_pickup">Ready for Customer Pickup (SMS)</option>
                  <option value="collected">Collected by Customer</option>
                  <option value="cancelled">Cancelled / Unrepairable</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Technician Diagnosis & Action Notes
                </label>
                <textarea
                  rows={3}
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  placeholder="e.g. Replaced DC power jack, cleaned fan and ran 24hr stress test."
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <Input
                label="Final Actual Cost (KES)"
                type="number"
                min="0"
                value={newActualCost || ''}
                onChange={(e) => setNewActualCost(Number(e.target.value))}
                helperText={`Deposit already received: ${formatKES(updateModalTicket.deposit_paid)}`}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setUpdateModalTicket(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={loading}>
                  Save Status
                </Button>
              </div>
            </form>
          )}
        </Dialog>

        {/* Printable Repair Intake Slip */}
        <Dialog
          isOpen={isSlipOpen}
          onClose={() => setIsSlipOpen(false)}
          title="Repair Intake Claim Slip"
          maxWidth="sm"
        >
          {selectedTicket && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs text-gray-800 space-y-3">
                <div className="text-center border-b border-dashed border-gray-300 pb-2">
                  <h4 className="font-bold text-sm uppercase">Vinnyx Technologies</h4>
                  <p className="text-[10px] text-gray-500">Hardware Repair & Service Workshop</p>
                  <p className="text-[10px] text-gray-500">Tel: 0700 000 000 | Main Branch</p>
                </div>

                <div className="text-[11px] space-y-0.5 border-b border-dashed border-gray-300 pb-2">
                  <div>Claim Slip: <strong className="font-bold">{selectedTicket.ticket_number}</strong></div>
                  <div>Date: {formatDate(selectedTicket.created_at)}</div>
                  <div>Customer: {selectedTicket.customer_name} ({selectedTicket.customer_phone})</div>
                  <div>Device: {selectedTicket.brand_model} [{selectedTicket.device_type}]</div>
                  {selectedTicket.serial_number && <div>Serial No: {selectedTicket.serial_number}</div>}
                </div>

                <div className="border-b border-dashed border-gray-300 pb-2 text-[11px]">
                  <span className="font-bold block">Reported Fault:</span>
                  <p className="text-gray-600">{selectedTicket.reported_fault}</p>
                </div>

                <div className="space-y-0.5 text-[11px] border-b border-dashed border-gray-300 pb-2">
                  <div className="flex justify-between">
                    <span>Estimated Repair:</span>
                    <span>{formatKES(selectedTicket.estimated_cost)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-blue-700">
                    <span>Deposit Received:</span>
                    <span>{formatKES(selectedTicket.deposit_paid)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-700">
                    <span>Est. Balance on Collection:</span>
                    <span>{formatKES(Math.max(0, selectedTicket.estimated_cost - selectedTicket.deposit_paid))}</span>
                  </div>
                </div>

                <div className="text-[9px] text-gray-500 pt-1 text-center">
                  <p>1. Present this slip upon collection.</p>
                  <p>2. Devices not collected within 30 days attract storage fees.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.print()} className="flex-1">
                  <Printer className="h-4 w-4 mr-1.5" /> Print Claim Slip
                </Button>
                <Button variant="primary" onClick={() => setIsSlipOpen(false)} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-1.5" /> Done
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </div>
  )
}
