import { request, generateIdempotencyKey } from './client'
import type { Expense } from '@/types'

const LOCAL_STORAGE_EXPENSES_KEY = 'vinnyx_expenses_db'

function getLocalExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EXPENSES_KEY)
    return raw ? JSON.parse(raw) : [
      {
        id: 'exp-1',
        branch_id: 1,
        category: 'stationery',
        amount: 350,
        description: 'Printing paper ream (Chamex)',
        receipt_ref: 'REC-901',
        recorded_by: 'Teller Jane',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'exp-2',
        branch_id: 1,
        category: 'staff_tea',
        amount: 150,
        description: 'Milk and tea leaves',
        receipt_ref: 'PETTY-02',
        recorded_by: 'Teller Jane',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      }
    ]
  } catch {
    return []
  }
}

function saveLocalExpenses(expenses: Expense[]) {
  localStorage.setItem(LOCAL_STORAGE_EXPENSES_KEY, JSON.stringify(expenses))
}

export const expensesApi = {
  async getExpenses(): Promise<Expense[]> {
    try {
      const data = await request<Expense[]>('/expenses')
      return Array.isArray(data) ? data : getLocalExpenses()
    } catch {
      return getLocalExpenses()
    }
  },

  async createExpense(payload: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
    const key = generateIdempotencyKey()
    try {
      return await request<Expense>('/expenses', {
        method: 'POST',
        idempotencyKey: key,
        body: JSON.stringify(payload),
      })
    } catch (err: any) {
      if (err.status === 0 || err.status === 404) {
        const newExp: Expense = {
          id: 'exp-' + Date.now(),
          ...payload,
          created_at: new Date().toISOString(),
        }
        const existing = getLocalExpenses()
        saveLocalExpenses([newExp, ...existing])
        return newExp
      }
      throw err
    }
  },
}
