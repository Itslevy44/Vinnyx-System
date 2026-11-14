import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatKES } from '@/lib/utils'
import {
  BarChart3,
  Download,
  TrendingUp,
  DollarSign,
  Users,
  Coins,
} from 'lucide-react'

export const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today')

  const summary = {
    totalRevenue: 48500,
    totalExpenses: 5200,
    netProfit: 43300,
    tellerCommissions: 6720,
    transactionCount: 84,
  }

  const categoryBreakdown = [
    { name: 'Printing & Photocopy', amount: 22400, percent: 46 },
    { name: 'Online Cyber Services (KRA/HELB/NTSA)', amount: 12500, percent: 26 },
    { name: 'Graphic Design & Eulogies', amount: 8600, percent: 18 },
    { name: 'Stationery & Accessories Sales', amount: 5000, percent: 10 },
  ]

  const methodBreakdown = [
    { method: 'M-Pesa (Till & STK)', amount: 31200, count: 54 },
    { method: 'Physical Cash Drawer', amount: 15300, count: 28 },
    { method: 'Customer Credit', amount: 2000, count: 2 },
  ]

  const tellerPerformance = [
    { name: 'Jane (Teller #01)', sales: 26400, commission: 3820, count: 48 },
    { name: 'David (Teller #02)', sales: 22100, commission: 2900, count: 36 },
  ]

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Category,Amount,Percentage\n' +
      categoryBreakdown.map((e) => `"${e.name}",${e.amount},${e.percent}%`).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `vinnyx_sales_report_${period}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>Performance Analytics & Business Reports</span>
              <Badge variant="info">Branch #01</Badge>
            </h1>
            <p className="text-xs text-gray-500">
              Audited sales volume, teller commission resolution, expense deductions and net earnings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white p-1 rounded-lg border border-gray-200">
              {(['today', 'week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-xs font-semibold rounded capitalize transition-all ${
                    period === p ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
            </Button>
          </div>
        </div>

        {/* High Level KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-white shadow-xs">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
              Gross Sales Revenue
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-extrabold text-gray-900">{formatKES(summary.totalRevenue)}</span>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">{summary.transactionCount} total orders</span>
          </Card>

          <Card className="p-4 bg-white shadow-xs">
            <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider block">
              Shop Expenses & Petty Cash
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-extrabold text-rose-600">{formatKES(summary.totalExpenses)}</span>
              <DollarSign className="h-5 w-5 text-rose-400" />
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Paper, toner, utilities</span>
          </Card>

          <Card className="p-4 bg-white shadow-xs">
            <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider block">
              Teller Commission Liability
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-extrabold text-amber-600">{formatKES(summary.tellerCommissions)}</span>
              <Coins className="h-5 w-5 text-amber-400" />
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Payable to staff</span>
          </Card>

          <Card className="p-4 bg-white shadow-xs">
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
              Estimated Net Operating Profit
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-extrabold text-blue-700">{formatKES(summary.netProfit)}</span>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-[11px] text-blue-700 mt-1 block">Before staff base salary deductions</span>
          </Card>
        </div>

        {/* Detailed Breakdown Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Category Contribution */}
          <Card className="shadow-xs">
            <CardHeader className="py-3 px-4 border-b border-gray-100">
              <CardTitle className="text-sm">Service Category Contribution</CardTitle>
              <CardDescription>Revenue distribution across core cyber domains</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-700">{cat.name}</span>
                    <span className="text-gray-900 font-bold">{formatKES(cat.amount)} ({cat.percent}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Method Distribution */}
          <Card className="shadow-xs">
            <CardHeader className="py-3 px-4 border-b border-gray-100">
              <CardTitle className="text-sm">Payment Gateway Distribution</CardTitle>
              <CardDescription>Collections categorized by swappable payment driver</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {methodBreakdown.map((m) => (
                <div
                  key={m.method}
                  className="p-3 rounded-lg border border-gray-100 bg-gray-50/70 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-gray-900 block">{m.method}</span>
                    <span className="text-[10px] text-gray-400">{m.count} successful transactions</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{formatKES(m.amount)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Teller Performance Table */}
        <Card className="shadow-xs">
          <CardHeader className="py-3 px-4 border-b border-gray-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Teller Sales & Commission Statement
              </CardTitle>
              <CardDescription>Individual productivity and snapshotted commissions</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Teller Name</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Receipts Issued</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Total Sales Handled</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Commission Accrued</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Effective Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tellerPerformance.map((t) => (
                    <tr key={t.name} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">{t.name}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{t.count}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">
                        {formatKES(t.sales)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-blue-700">
                        {formatKES(t.commission)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 font-mono">
                        {((t.commission / t.sales) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
