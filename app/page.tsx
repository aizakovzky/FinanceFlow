'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { FinanceProvider, type Expense } from '@/hooks/use-finances'
import { useTheme } from '@/hooks/use-theme'
import Sidebar from '@/components/sidebar'
import Dashboard from '@/components/dashboard'
import ExpensesPage from '@/components/expenses-page'
import BudgetsPage from '@/components/budgets-page'
import AnalyticsPage from '@/components/analytics-page'
import RecurringPage from '@/components/recurring-page'
import SettingsPage from '@/components/settings-page'
import QuickAddModal from '@/components/quick-add-modal'
import { Plus } from 'lucide-react'

export type Page = 'dashboard' | 'expenses' | 'budgets' | 'analytics' | 'recurring' | 'settings'

function AppShell() {
  const { toggle, theme, mounted } = useTheme()
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const toggleQuickAdd = useCallback(() => {
    setQuickAddOpen(prev => !prev)
  }, [])

  const handleEditExpense = useCallback((expense: Expense) => {
    setEditingExpense(expense)
    setQuickAddOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setQuickAddOpen(false)
    setEditingExpense(null)
  }, [])

  // Keyboard shortcut for Quick Add
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setEditingExpense(null)
        setQuickAddOpen(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setEditingExpense(null)
        setQuickAddOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        theme={theme}
        onToggleTheme={toggle}
        mounted={mounted}
      />

      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {currentPage === 'dashboard' && <Dashboard setCurrentPage={setCurrentPage} />}
        {currentPage === 'expenses' && <ExpensesPage onEditExpense={handleEditExpense} />}
        {currentPage === 'budgets' && <BudgetsPage />}
        {currentPage === 'analytics' && <AnalyticsPage />}
        {currentPage === 'recurring' && <RecurringPage />}
        {currentPage === 'settings' && <SettingsPage />}
      </main>

      {/* Mobile bottom tab bar */}
      <MobileNav currentPage={currentPage} setCurrentPage={setCurrentPage} onQuickAdd={() => { setEditingExpense(null); setQuickAddOpen(true) }} />

      {/* Floating Quick Add button */}
      <button
        onClick={() => { setEditingExpense(null); setQuickAddOpen(true) }}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30 flex items-center gap-2 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition-all max-md:w-14 max-md:h-14 max-md:justify-center md:px-5 md:py-3"
        aria-label="Quick add transaction"
      >
        <Plus className="w-5 h-5" />
        <span className="hidden md:inline text-sm font-medium">Add Transaction</span>
      </button>

      <QuickAddModal open={quickAddOpen} onClose={handleCloseModal} editingExpense={editingExpense} />
    </div>
  )
}

function MobileNav({ currentPage, setCurrentPage, onQuickAdd }: { currentPage: Page; setCurrentPage: (p: Page) => void; onQuickAdd: () => void }) {
  const items: { id: Page; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'expenses', label: 'Expenses', icon: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6' },
    { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'budgets', label: 'Budgets', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 md:hidden bg-card border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${currentPage === item.id
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-muted-foreground'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <FinanceProvider userId={user.id}>
      <AppShell />
    </FinanceProvider>
  )
}
