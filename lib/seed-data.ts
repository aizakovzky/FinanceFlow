'use client'

import { hasAnyUsers, registerUser, type LocalUser } from '@/lib/local-auth'

const DEMO_EMAIL = 'demo@financeflow.app'
const DEMO_PASSWORD = 'demo123'
const DEMO_NAME = 'Demo User'

export function seedDemoData() {
    if (typeof window === 'undefined') return
    if (hasAnyUsers()) return

    const result = registerUser(DEMO_NAME, DEMO_EMAIL, DEMO_PASSWORD)
    if (!result.success) return
    const user = (result as { success: true; user: LocalUser }).user

    const now = new Date()
    const thisMonth = (day: number) => {
        const d = new Date(now.getFullYear(), now.getMonth(), day)
        return d.toISOString().split('T')[0]
    }
    const lastMonth = (day: number) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 1, day)
        return d.toISOString().split('T')[0]
    }

    const expenses = [
        { id: crypto.randomUUID(), amount: 45.50, description: 'Grocery shopping', category: 'food', date: thisMonth(2) },
        { id: crypto.randomUUID(), amount: 12.00, description: 'Lunch with coworkers', category: 'food', date: thisMonth(5) },
        { id: crypto.randomUUID(), amount: 8.50, description: 'Morning coffee & pastry', category: 'food', date: thisMonth(8) },
        { id: crypto.randomUUID(), amount: 32.00, description: 'Train monthly pass top-up', category: 'transport', date: thisMonth(1) },
        { id: crypto.randomUUID(), amount: 15.00, description: 'Uber ride home', category: 'transport', date: thisMonth(10) },
        { id: crypto.randomUUID(), amount: 14.99, description: 'Netflix subscription', category: 'entertainment', date: thisMonth(3) },
        { id: crypto.randomUUID(), amount: 25.00, description: 'Movie tickets', category: 'entertainment', date: thisMonth(7) },
        { id: crypto.randomUUID(), amount: 85.00, description: 'Electric bill', category: 'utilities', date: thisMonth(5) },
        { id: crypto.randomUUID(), amount: 45.00, description: 'Internet bill', category: 'utilities', date: thisMonth(6) },
        { id: crypto.randomUUID(), amount: 67.00, description: 'New running shoes', category: 'shopping', date: thisMonth(9) },
        { id: crypto.randomUUID(), amount: 29.99, description: 'Book order', category: 'shopping', date: thisMonth(4) },
        { id: crypto.randomUUID(), amount: 20.00, description: 'Pharmacy', category: 'healthcare', date: thisMonth(3) },
        { id: crypto.randomUUID(), amount: 120.00, description: 'Weekly groceries', category: 'food', date: lastMonth(5) },
        { id: crypto.randomUUID(), amount: 55.00, description: 'Gas station', category: 'transport', date: lastMonth(12) },
        { id: crypto.randomUUID(), amount: 90.00, description: 'Electric bill', category: 'utilities', date: lastMonth(8) },
    ]

    const budgets = [
        { id: crypto.randomUUID(), category: 'food', limit: 500 },
        { id: crypto.randomUUID(), category: 'transport', limit: 200 },
        { id: crypto.randomUUID(), category: 'entertainment', limit: 150 },
        { id: crypto.randomUUID(), category: 'utilities', limit: 300 },
        { id: crypto.randomUUID(), category: 'shopping', limit: 200 },
        { id: crypto.randomUUID(), category: 'healthcare', limit: 100 },
    ]

    const recurring = [
        { id: crypto.randomUUID(), amount: 14.99, description: 'Netflix', category: 'entertainment', frequency: 'monthly', nextDate: thisMonth(15), type: 'expense' },
        { id: crypto.randomUUID(), amount: 45.00, description: 'Internet', category: 'utilities', frequency: 'monthly', nextDate: thisMonth(20), type: 'expense' },
    ]

    localStorage.setItem(`ff_user_${user.id}_expenses`, JSON.stringify(expenses))
    localStorage.setItem(`ff_user_${user.id}_budgets`, JSON.stringify(budgets))
    localStorage.setItem(`ff_user_${user.id}_recurring`, JSON.stringify(recurring))
    localStorage.setItem(`ff_user_${user.id}_currency`, 'USD')

    localStorage.removeItem('ff_current_session')
}
