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

const DEFAULT_BUDGETS: Budget[] = [
  { id: '1', category: 'food', limit: 500 },
  { id: '2', category: 'transport', limit: 200 },
  { id: '3', category: 'entertainment', limit: 150 },
  { id: '4', category: 'utilities', limit: 300 },
  { id: '5', category: 'shopping', limit: 200 },
  { id: '6', category: 'healthcare', limit: 100 },
]

function userKey(userId: string, suffix: string) {
  return `ff_user_${userId}_${suffix}`
}

export function FinanceProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([])
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(false)
    try {
      if (typeof window !== 'undefined') {
        const savedExpenses = localStorage.getItem(userKey(userId, 'expenses'))
        const savedBudgets = localStorage.getItem(userKey(userId, 'budgets'))
        const savedRecurring = localStorage.getItem(userKey(userId, 'recurring'))
        const savedCurrency = localStorage.getItem(userKey(userId, 'currency'))

        setExpenses(savedExpenses ? JSON.parse(savedExpenses) : [])
        setBudgets(savedBudgets ? JSON.parse(savedBudgets) : DEFAULT_BUDGETS)
        setRecurring(savedRecurring ? JSON.parse(savedRecurring) : [])
        setCurrencyState((savedCurrency as CurrencyCode) || 'USD')
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e)
    } finally {
      setIsLoaded(true)
    }
  }, [userId])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined')
      localStorage.setItem(userKey(userId, 'expenses'), JSON.stringify(expenses))
  }, [expenses, isLoaded, userId])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined')
      localStorage.setItem(userKey(userId, 'budgets'), JSON.stringify(budgets))
  }, [budgets, isLoaded, userId])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined')
      localStorage.setItem(userKey(userId, 'recurring'), JSON.stringify(recurring))
  }, [recurring, isLoaded, userId])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined')
      localStorage.setItem(userKey(userId, 'currency'), currency)
  }, [currency, isLoaded, userId])

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    const id = crypto.randomUUID()
    setExpenses(prev => [...prev, { ...expense, id }])
    return id
  }, [])

  const importExpenses = useCallback(async (items: Omit<Expense, 'id'>[]) => {
    const newItems = items.map(item => ({ ...item, id: crypto.randomUUID() }))
    setExpenses(prev => [...prev, ...newItems])
  }, [])

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
  }, [])

  const updateExpense = useCallback(async (id: string, updates: Partial<Omit<Expense, 'id'>>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }, [])

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }, [])

  const addRecurring = useCallback(async (t: Omit<RecurringTransaction, 'id'>) => {
    const id = crypto.randomUUID()
    setRecurring(prev => [...prev, { ...t, id }])
    return id
  }, [])

  const deleteRecurring = useCallback((id: string) => {
    setRecurring(prev => prev.filter(r => r.id !== id))
  }, [])

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c)
  }, [])

  const clearAllData = useCallback(() => {
    setExpenses([])
    setRecurring([])
    setBudgets(DEFAULT_BUDGETS)
    setCurrencyState('USD')
    if (typeof window !== 'undefined') {
      localStorage.removeItem(userKey(userId, 'expenses'))
      localStorage.removeItem(userKey(userId, 'recurring'))
      localStorage.removeItem(userKey(userId, 'budgets'))
      localStorage.removeItem(userKey(userId, 'currency'))
    }
  }, [userId])

  return (
    <FinanceContext value={{
      expenses, budgets, recurring, currency, isLoaded,
      addExpense, importExpenses, deleteExpense, updateExpense,
      updateBudget, addRecurring, deleteRecurring, setCurrency, clearAllData,
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
    USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB', JPY: 'ja-JP',
    AUD: 'en-AU', CAD: 'en-CA', CHF: 'de-CH', CNY: 'zh-CN',
    INR: 'en-IN', BRL: 'pt-BR',
  }
  return localeMap[currency] || 'en-US'
}

export function useFormatCurrency() {
  const { currency } = useFinances()
  return useCallback((amount: number) => formatCurrency(amount, currency), [currency])
}
