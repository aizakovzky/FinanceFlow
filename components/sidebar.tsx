'use client'

import { useAuth } from '@/hooks/use-auth'
import { BarChart3, DollarSign, PieChart, Repeat, Settings, TrendingDown, Moon, Sun, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Page } from '@/app/page'

interface SidebarProps {
  currentPage: Page
  setCurrentPage: (page: Page) => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  mounted: boolean
}

const menuItems: { id: Page; label: string; icon: typeof BarChart3 }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'expenses', label: 'Expenses', icon: TrendingDown },
  { id: 'budgets', label: 'Budgets', icon: DollarSign },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
  { id: 'recurring', label: 'Recurring', icon: Repeat },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ currentPage, setCurrentPage, theme, onToggleTheme, mounted }: SidebarProps) {
  const { user, logout } = useAuth()

  return (
    <aside className="hidden md:flex flex-col w-60 bg-card border-r border-border h-dvh shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">FinanceFlow</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                active
                  ? 'bg-emerald-600 text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-4.5 h-4.5" />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* User info + Theme toggle + footer */}
      <div className="px-3 pb-4 space-y-3 border-t border-border pt-4">
        {user && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-foreground truncate">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        {mounted && (
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign Out
        </button>
        <div className="text-[11px] text-muted-foreground text-center px-3">
          <p>FinanceFlow v3.0</p>
          <p className="mt-0.5">Press <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">C</kbd> to quick-add</p>
        </div>
      </div>
    </aside>
  )
}
