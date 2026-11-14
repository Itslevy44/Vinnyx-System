import React, { useState, useEffect } from 'react'
import { payrollApi } from '@/api/payroll'
import type { PayrollRecord } from '@/types'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { formatKES } from '@/lib/utils'
import {
  Wallet,
  CheckCircle2,
  Printer,
  Calendar,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'

export const PayrollPage: React.FC = () => {
  const { user, hasRole } = useAuth()
  const [records, setRecords] = useState<PayrollRecord[]>([])
  const [selectedMonth, setSelectedMonth] = useState('2026-11')
  const [activePayslip, setActivePayslip] = useState<PayrollRecord | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    payrollApi.getRecords(selectedMonth).then(setRecords)
  }, [selectedMonth])

  const totalPayroll = records.reduce((acc, r) => acc + r.net_payout, 0)
  const totalCommissions = records.reduce((acc, r) => acc + r.commission_earned, 0)
  const totalSalesVolume = records.reduce((acc, r) => acc + r.total_sales, 0)

  const handleApprove = async (id: string) => {
    if (!hasRole('owner')) {
      alert('Only the System Owner can approve payroll batches.')
      return
    }
    setLoading(true)
    try {
      const updated = await payrollApi.approvePayroll(id, user?.name || 'Vincent (Owner)')
      setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPaid = async (id: string) => {
    if (!hasRole('owner')) {
      alert('Only the System Owner can release payroll disbursements.')
      return
    }
    setLoading(true)
    try {
      const updated = await payrollApi.markPaid(id)
      setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
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
              <span>Staff Payroll & Commission Settlement</span>
              <Badge variant="info">Branch #01</Badge>
            </h1>
            <p className="text-xs text-gray-500">
              Aggregated monthly teller sales commission lines, base salaries, and owner approvals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs">
              <Calendar className="h-3.5 w-3.5 text-gray-500" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent font-semibold text-gray-800 focus:outline-none cursor-pointer"
              >
                <option value="2026-11">November 2026</option>
                <option value="2026-10">October 2026</option>
                <option value="2026-09">September 2026</option>
              </select>
            </div>
          </div>
        </div>

        {/* Top Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-white shadow-xs">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
              Total Month Sales Volume
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-extrabold text-gray-900">{formatKES(totalSalesVolume)}</span>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Combined teller transactions</span>
          </Card>

          <Card className="p-4 bg-white shadow-xs">
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
              Earned Commission Pool
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-extrabold text-blue-700">{formatKES(totalCommissions)}</span>
              <Wallet className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-[11px] text-blue-700 mt-1 block">
              10%–25% snapshotted from service sales lines
            </span>
          </Card>

          <Card className="p-4 bg-white shadow-xs">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
              Net Total Disbursement
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-extrabold text-slate-900">{formatKES(totalPayroll)}</span>
              <Badge variant="neutral">{records.length} Staff</Badge>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Base + Commission + Bonus - Deductions</span>
          </Card>
        </div>

        {/* Payroll Records Table */}
        <Card className="shadow-xs">
          <CardHeader className="py-3 px-4 border-b border-gray-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Monthly Compensation Roster</CardTitle>
            {!hasRole('owner') && (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Staff View (Owner signs off approval)
              </span>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Staff Member</th>
                    <th className="px-4 py-2.5 font-semibold">Role</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Base Salary</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Service Sales</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Commission</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Bonus / Ded.</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Net Payout</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Status</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">{r.staff_name}</td>
                      <td className="px-4 py-3">
                        <Badge variant="neutral" className="uppercase text-[10px]">
                          {r.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatKES(r.base_salary)}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatKES(r.total_sales)}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-700">
                        {formatKES(r.commission_earned)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 text-[11px]">
                        +{formatKES(r.bonus)} / -{formatKES(r.deductions)}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-gray-900 text-sm">
                        {formatKES(r.net_payout)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={
                            r.status === 'paid'
                              ? 'success'
                              : r.status === 'approved'
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActivePayslip(r)}
                          >
                            <Printer className="h-3 w-3 mr-1" /> Slip
                          </Button>

                          {r.status === 'draft' && hasRole('owner') && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleApprove(r.id)}
                              isLoading={loading}
                            >
                              Approve
                            </Button>
                          )}

                          {r.status === 'approved' && hasRole('owner') && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleMarkPaid(r.id)}
                              isLoading={loading}
                            >
                              Disburse
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Printable Payslip Modal */}
        <Dialog
          isOpen={!!activePayslip}
          onClose={() => setActivePayslip(null)}
          title="Staff Payslip"
          maxWidth="sm"
        >
          {activePayslip && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs text-gray-800 space-y-3">
                <div className="text-center border-b border-dashed border-gray-300 pb-2">
                  <h4 className="font-bold text-sm uppercase">Vinnyx Technologies</h4>
                  <p className="text-[10px] text-gray-500">Staff Monthly Payslip</p>
                  <p className="text-[10px] text-gray-500">Period: {activePayslip.month}</p>
                </div>

                <div className="text-[11px] space-y-0.5 border-b border-dashed border-gray-300 pb-2">
                  <div>Employee: <strong className="font-bold">{activePayslip.staff_name}</strong></div>
                  <div>Role: {activePayslip.role.toUpperCase()}</div>
                  <div>Status: {activePayslip.status.toUpperCase()}</div>
                  {activePayslip.approved_by && <div>Approved By: {activePayslip.approved_by}</div>}
                </div>

                <div className="space-y-1 border-b border-dashed border-gray-300 pb-2 text-[11px]">
                  <div className="flex justify-between">
                    <span>Basic Base Salary:</span>
                    <span>{formatKES(activePayslip.base_salary)}</span>
                  </div>
                  <div className="flex justify-between text-blue-700 font-bold">
                    <span>Sales Commission ({formatKES(activePayslip.total_sales)} sales):</span>
                    <span>{formatKES(activePayslip.commission_earned)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance Bonus:</span>
                    <span>+{formatKES(activePayslip.bonus)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Statutory / Advance Deductions:</span>
                    <span>-{formatKES(activePayslip.deductions)}</span>
                  </div>
                </div>

                <div className="flex justify-between font-extrabold text-sm border-b border-dashed border-gray-300 pb-2">
                  <span>NET PAYABLE:</span>
                  <span>{formatKES(activePayslip.net_payout)}</span>
                </div>

                <div className="text-[10px] text-center text-gray-400 pt-1">
                  Generated by Vinnyx Automated Payroll Engine
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.print()} className="flex-1">
                  <Printer className="h-4 w-4 mr-1.5" /> Print Payslip
                </Button>
                <Button variant="primary" onClick={() => setActivePayslip(null)} className="flex-1">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Close
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </div>
  )
}
