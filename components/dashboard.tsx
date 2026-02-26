'use client'

import { useMemo } from 'react'
import { useFinances, useFormatCurrency, getExpensesByMonth, getBudgetSpending, getSpendingByCategory, CATEGORIES } from '@/hooks/use-finances'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingDown, Plus, AlertCircle, ArrowRight } from 'lucide-react'
import { CardSkeleton, ListSkeleton } from '@/components/skeleton-loaders'
import type { Page } from '@/app/page'

interface DashboardProps {
  setCurrentPage: (page: Page) => void
}

export default function Dashboard({ setCurrentPage }: DashboardProps) {
  const { expenses, budgets, isLoaded } = useFinances()
  const fmt = useFormatCurrency()

  const now = useMemo(() => new Date(), [])
  const monthlyExpenses = useMemo(() => getExpensesByMonth(expenses, now), [expenses, now])
  const monthlyTotal = useMemo(() => monthlyExpenses.reduce((s, e) => s + e.amount, 0), [monthlyExpenses])
  const spendingByCategory = useMemo(() => getSpendingByCategory(monthlyExpenses), [monthlyExpenses])

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)

  if (!isLoaded) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-36 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ListSkeleton rows={4} /><ListSkeleton rows={4} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">Dashboard</h1>
          <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium mt-1">Finance Flow: Streamline your savings.</p>
          <p className="text-muted-foreground text-sm mt-0.5">A high-level summary of your net balance and recent activity.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Monthly Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-3xl font-bold text-foreground">{fmt(monthlyTotal)}</p>
            <p className="text-xs text-muted-foreground mt-1">{monthlyExpenses.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Budget Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {budgets.slice(0, 3).map(budget => {
              const spent = getBudgetSpending(budget.category, monthlyExpenses)
              const pct = budget.limit > 0 ? (spent / budget.limit) * 100 : 0
              return (
                <div key={budget.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize text-foreground">{budget.category}</span>
                    <span className="text-muted-foreground">{Math.round(pct)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button onClick={() => setCurrentPage('analytics')} variant="outline">
              View Analytics <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <CardDescription>Latest expenses this month</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyExpenses.length === 0 ? (
              <div className="text-center py-8">
                <TrendingDown className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-muted-foreground text-sm">No expenses yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {monthlyExpenses.slice(-5).reverse().map(e => (
                  <div key={e.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground truncate">{e.description}</p>
                      <p className="text-xs text-muted-foreground capitalize">{e.category}</p>
                    </div>
                    <p className="font-semibold text-sm text-foreground ml-4 shrink-0">
                      -{fmt(e.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spending by category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spending by Category</CardTitle>
            <CardDescription>This month&apos;s distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.entries(spendingByCategory).filter(([, a]) => a > 0).length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-muted-foreground text-sm">No data yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(spendingByCategory)
                  .filter(([, a]) => a > 0)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([cat, amount]) => {
                    const catInfo = CATEGORIES.find(c => c.value === cat)
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize text-foreground font-medium">{cat}</span>
                          <span className="text-foreground font-semibold">{fmt(amount)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${Math.max((amount / monthlyTotal) * 100, 5)}%`,
                              backgroundColor: catInfo?.color || '#10b981',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
