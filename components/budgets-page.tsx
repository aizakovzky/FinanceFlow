'use client'

import { useState, useMemo } from 'react'
import { useFinances, useFormatCurrency, getExpensesByMonth, getBudgetSpending } from '@/hooks/use-finances'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, TrendingUp, Zap } from 'lucide-react'
import { CardSkeleton } from '@/components/skeleton-loaders'

const JPY_BUDGET_DEFAULTS: Record<string, number> = {
  food: 50000,
  transport: 15000,
  entertainment: 20000,
  utilities: 25000,
  shopping: 30000,
  healthcare: 10000,
}

export default function BudgetsPage() {
  const { expenses, budgets, currency, isLoaded, updateBudget } = useFinances()
  const fmt = useFormatCurrency()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const now = useMemo(() => new Date(), [])
  const monthlyExpenses = useMemo(() => getExpensesByMonth(expenses, now), [expenses, now])

  // Detect if user is on JPY and budgets are still at the USD default (500)
  const showJpyBanner = useMemo(() => {
    if (currency !== 'JPY') return false
    return budgets.some(b => b.limit === 500)
  }, [currency, budgets])

  const handleScaleForJpy = () => {
    budgets.forEach(b => {
      const jpyLimit = JPY_BUDGET_DEFAULTS[b.category]
      if (jpyLimit && b.limit === 500) {
        updateBudget(b.id, { limit: jpyLimit })
      }
    })
  }

  const handleEdit = (id: string) => {
    const b = budgets.find(b => b.id === id)
    if (b) { setEditingId(id); setEditValue(b.limit.toString()) }
  }

  const handleSave = (id: string) => {
    const val = parseFloat(editValue)
    if (!isNaN(val) && val > 0) { updateBudget(id, { limit: val }); setEditingId(null) }
  }

  if (!isLoaded) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Budgets</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your monthly budget limits</p>
      </div>

      {/* JPY scaling banner */}
      {showJpyBanner && (
        <Card className="border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10">
          <CardContent className="py-4 px-5">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Your budgets need scaling for JPY</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Default budgets of ¥500 are far too low for Japanese Yen.
                  Click below to set sensible defaults (e.g. Food &amp; Dining: ¥50,000, Transport: ¥15,000).
                </p>
                <Button
                  onClick={handleScaleForJpy}
                  size="sm"
                  className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5" /> Scale Budgets for ¥
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map(budget => {
          const spent = getBudgetSpending(budget.category, monthlyExpenses)
          const pct = budget.limit > 0 ? (spent / budget.limit) * 100 : 0
          const isOver = spent > budget.limit
          const isAlmost = pct > 80 && !isOver

          return (
            <Card
              key={budget.id}
              className={
                isOver ? 'border-red-500/40' : isAlmost ? 'border-amber-500/40' : ''
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm capitalize">{budget.category}</CardTitle>
                  {isOver && <AlertCircle className="w-4 h-4 text-red-500" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Spent</span>
                    <span className={`font-semibold ${isOver ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                      {fmt(spent)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${isOver ? 'bg-red-500' : isAlmost ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">{Math.round(pct)}% of budget</p>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Limit</span>
                    {editingId === budget.id ? (
                      <div className="flex gap-1.5">
                        <Input
                          type="number"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="w-20 h-7 text-xs"
                        />
                        <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleSave(budget.id)}>
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-foreground">{fmt(budget.limit)}</span>
                        <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => handleEdit(budget.id)}>Edit</Button>
                      </div>
                    )}
                  </div>
                  {isOver && (
                    <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-xs text-red-700 dark:text-red-400">
                      Over budget by {fmt(spent - budget.limit)}
                    </div>
                  )}
                  {isAlmost && (
                    <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-xs text-amber-700 dark:text-amber-400">
                      {fmt(budget.limit - spent)} remaining
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Budget Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm text-muted-foreground">
          <p>Review your budgets monthly and adjust based on spending patterns.</p>
          <p>Set realistic limits that challenge you but remain achievable.</p>
          <p>Track recurring expenses to ensure they fit within your budgets.</p>
        </CardContent>
      </Card>
    </div>
  )
}
