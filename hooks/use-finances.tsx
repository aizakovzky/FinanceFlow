'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export type Category = 'food' | 'transport' | 'entertainment' | 'utilities' | 'shopping' | 'healthcare' | 'other' | 'income'

export interface Expense {
  id: string
  amount: number
  description: string
  category: Category
  date: string
  recurring?: boolean
  recurringId?: string
}

export interface Budget {
  id: string
  category: Category
  limit: number
}

export interface RecurringTransaction {
  id: string
  amount: number
  description: string
  category: Category
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  nextDate: string
  type: 'expense' | 'income'
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'CHF' | 'CNY' | 'INR' | 'BRL'

export const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '\u20AC' },
  { code: 'GBP', label: 'British Pound', symbol: '\u00A3' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '\u00A5' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', label: 'Chinese Yuan', symbol: '\u00A5' },
  { code: 'INR', label: 'Indian Rupee', symbol: '\u20B9' },
  { code: 'BRL', label: 'Brazilian Real', symbol: 'R$' },
]

export const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: 'food', label: 'Food & Dining', color: '#10b981' },
  { value: 'transport', label: 'Transport', color: '#3b82f6' },
  { value: 'entertainment', label: 'Entertainment', color: '#f59e0b' },
  { value: 'utilities', label: 'Utilities', color: '#ef4444' },
  { value: 'shopping', label: 'Shopping', color: '#8b5cf6' },
  { value: 'healthcare', label: 'Healthcare', color: '#ec4899' },
  { value: 'income', label: 'Income', color: '#06b6d4' },
  { value: 'other', label: 'Other', color: '#6b7280' },
]

// ────────────────── Context ──────────────────

interface FinanceContextType {
  expenses: Expense[]
  budgets: Budget[]
  recurring: RecurringTransaction[]
  currency: CurrencyCode
  isLoaded: boolean
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<string>
  importExpenses: (items: Omit<Expense, 'id'>[]) => Promise<void>
  deleteExpense: (id: string) => void
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id'>>) => Promise<void>
  updateBudget: (id: string, updates: Partial<Budget>) => void
  addRecurring: (t: Omit<RecurringTransaction, 'id'>) => Promise<string>
  deleteRecurring: (id: string) => void
  setCurrency: (c: CurrencyCode) => void
  clearAllData: () => void
}

const FinanceContext = createContext<FinanceContextType | null>(null)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([])
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from API on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [txRes, budgetRes, recurRes, settingsRes] = await Promise.all([
          fetch('/api/transactions'),
          fetch('/api/budgets'),
          fetch('/api/recurring'),
          fetch('/api/settings'),
        ])

        if (txRes.ok) {
          const txData = await txRes.json()
          setExpenses(txData.map((t: Record<string, unknown>) => ({
            ...t,
            date: typeof t.date === 'string' ? t.date.split('T')[0] : t.date,
          })))
        }
        if (budgetRes.ok) setBudgets(await budgetRes.json())
        if (recurRes.ok) {
          const recurData = await recurRes.json()
          setRecurring(recurData.map((r: Record<string, unknown>) => ({
            ...r,
            nextDate: typeof r.nextDate === 'string' ? r.nextDate.split('T')[0] : r.nextDate,
          })))
        }
        if (settingsRes.ok) {
          const s = await settingsRes.json()
          setCurrencyState(s.currency || 'USD')
        }
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setIsLoaded(true)
      }
    }
    loadData()
  }, [])

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    })
    const created = await res.json()
    const mapped = { ...created, date: created.date?.split('T')[0] || created.date }
    setExpenses(prev => [...prev, mapped])
    return created.id as string
  }, [])

  const importExpenses = useCallback(async (items: Omit<Expense, 'id'>[]) => {
    const results = await Promise.all(
      items.map(item =>
        fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        }).then(res => res.json())
      )
    )
    const mapped = results.map(t => ({ ...t, date: t.date?.split('T')[0] || t.date }))
    setExpenses(prev => [...prev, ...mapped])
  }, [])

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
    fetch(`/api/transactions/${id}`, { method: 'DELETE' }).catch(console.error)
  }, [])

  const updateExpense = useCallback(async (id: string, updates: Partial<Omit<Expense, 'id'>>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
    await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(console.error)
  }, [])

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
    fetch('/api/budgets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    }).catch(console.error)
  }, [])

  const addRecurring = useCallback(async (t: Omit<RecurringTransaction, 'id'>) => {
    const res = await fetch('/api/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t),
    })
    const created = await res.json()
    const mapped = { ...created, nextDate: created.nextDate?.split('T')[0] || created.nextDate }
    setRecurring(prev => [...prev, mapped])
    return created.id as string
  }, [])

  const deleteRecurring = useCallback((id: string) => {
    setRecurring(prev => prev.filter(r => r.id !== id))
    fetch(`/api/recurring/${id}`, { method: 'DELETE' }).catch(console.error)
  }, [])

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c)
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currency: c }),
    }).catch(console.error)
  }, [])

  const clearAllData = useCallback(() => {
    // Delete all transactions and recurring via API
    expenses.forEach(e => fetch(`/api/transactions/${e.id}`, { method: 'DELETE' }).catch(console.error))
    recurring.forEach(r => fetch(`/api/recurring/${r.id}`, { method: 'DELETE' }).catch(console.error))
    setExpenses([])
    setRecurring([])
    setCurrencyState('USD')
  }, [expenses, recurring])

  return (
    <FinanceContext value={{
      expenses,
      budgets,
      recurring,
      currency,
      isLoaded,
      addExpense,
      importExpenses,
      deleteExpense,
      updateExpense,
      updateBudget,
      addRecurring,
      deleteRecurring,
      setCurrency,
      clearAllData,
    }}>
      {children}
    </FinanceContext>
  )
}

export function useFinances() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinances must be used within <FinanceProvider>')
  return ctx
}

// ────────────────── Derived helpers ──────────────────

export function getExpensesByMonth(expenses: Expense[], date: Date) {
  const y = date.getFullYear()
  const m = date.getMonth()
  return expenses.filter(e => {
    const d = new Date(e.date)
    return d.getFullYear() === y && d.getMonth() === m
  })
}

export function getBudgetSpending(category: Category, expenses: Expense[]) {
  return expenses.filter(e => e.category === category).reduce((s, e) => s + e.amount, 0)
}

export function getSpendingByCategory(expenses: Expense[]) {
  const map: Partial<Record<Category, number>> = {}
  expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount })
  return map
}

export function getMonthlyTrend(expenses: Expense[], months = 6) {
  const trend: { month: string; amount: number }[] = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthExpenses = getExpensesByMonth(expenses, d)
    trend.push({
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      amount: monthExpenses.reduce((s, e) => s + e.amount, 0),
    })
  }
  return trend
}

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD') {
  return new Intl.NumberFormat(getCurrencyLocale(currency), { style: 'currency', currency }).format(amount)
}

function getCurrencyLocale(currency: CurrencyCode): string {
  const localeMap: Record<CurrencyCode, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    JPY: 'ja-JP',
    AUD: 'en-AU',
    CAD: 'en-CA',
    CHF: 'de-CH',
    CNY: 'zh-CN',
    INR: 'en-IN',
    BRL: 'pt-BR',
  }
  return localeMap[currency] || 'en-US'
}

/** Hook that returns a formatCurrency bound to the user's chosen currency */
export function useFormatCurrency() {
  const { currency } = useFinances()
  return useCallback((amount: number) => formatCurrency(amount, currency), [currency])
}
