import React, { useState, useEffect } from 'react'
import { expensesApi } from '@/api/expenses'
import type { Expense } from '@/types'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatKES, formatDate } from '@/lib/utils'
import { DollarSign, Plus } from 'lucide-react'

export const ExpensesPage: React.FC = () => {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [category, setCategory] = useState<Expense['category']>('stationery')
  const [amount, setAmount] = useState<number>(0)
  const [description, setDescription] = useState('')
  const [receiptRef, setReceiptRef] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    expensesApi.getExpenses().then(setExpenses)
  }, [])

  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (amount <= 0 || !description.trim()) {
      alert('Please enter a valid expense amount and description')
      return
    }

    setLoading(true)
    try {
      const newExp = await expensesApi.createExpense({
        branch_id: 1,
        category,
        amount,
        description: description.trim(),
        receipt_ref: receiptRef.trim() || undefined,
        recorded_by: user?.name || 'Staff',
      })
      setExpenses([newExp, ...expenses])
      setAmount(0)
      setDescription('')
      setReceiptRef('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Expenses & Petty Cash</h1>
            <p className="text-xs text-gray-500">
              Record daily shop expenses and petty cash expenditures for day-close reconciliation.
            </p>
          </div>

          <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
                Today's Outflow
              </span>
              <span className="text-base font-extrabold text-rose-600">{formatKES(totalExpenses)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Record Expense Form */}
          <Card className="md:col-span-1 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-600" />
                Record Shop Expense
              </CardTitle>
              <CardDescription>Deducted from petty cash pool</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Expense Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="stationery">Stationery & Printing Paper</option>
                    <option value="staff_tea">Staff Welfare & Tea</option>
                    <option value="repairs">Equipment Repairs / Toner Refill</option>
                    <option value="utilities">Internet / Electricity Tokens</option>
                    <option value="rent">Shop Rent & Rates</option>
                    <option value="other">Other Operational Expense</option>
                  </select>
                </div>

                <Input
                  label="Amount (KES)"
                  type="number"
                  min="1"
                  placeholder="e.g. 500"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                />

                <Input
                  label="Description / Purpose"
                  placeholder="e.g. Bought 2 reams of A4 paper"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />

                <Input
                  label="Receipt Ref / Note (Optional)"
                  placeholder="e.g. REC-584 or Cash Voucher #3"
                  value={receiptRef}
                  onChange={(e) => setReceiptRef(e.target.value)}
                />

                <Button type="submit" isLoading={loading} className="w-full">
                  Record Expense
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Expense History Table */}
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm">Recorded Expenses</CardTitle>
                <CardDescription>All expenditures logged during the current day cycle</CardDescription>
              </div>
              <Badge variant="neutral">{expenses.length} Records</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-y border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Time</th>
                      <th className="px-4 py-2.5 font-semibold">Category</th>
                      <th className="px-4 py-2.5 font-semibold">Description</th>
                      <th className="px-4 py-2.5 font-semibold">Recorded By</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                          No expenses recorded yet today.
                        </td>
                      </tr>
                    ) : (
                      expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                            {formatDate(exp.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="neutral" className="capitalize">
                              {exp.category.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-900 font-medium">
                            {exp.description}
                            {exp.receipt_ref && (
                              <span className="block text-[10px] text-gray-400 font-mono mt-0.5">
                                Ref: {exp.receipt_ref}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{exp.recorded_by}</td>
                          <td className="px-4 py-3 text-right font-bold text-rose-600">
                            {formatKES(exp.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
