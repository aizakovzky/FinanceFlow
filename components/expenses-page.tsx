'use client'

import { useState } from 'react'
import { useFinances, useFormatCurrency, type Category, type Expense, CATEGORIES } from '@/hooks/use-finances'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Pencil } from 'lucide-react'
import { ListSkeleton } from '@/components/skeleton-loaders'

interface ExpensesPageProps {
  onEditExpense?: (expense: Expense) => void
}

export default function ExpensesPage({ onEditExpense }: ExpensesPageProps) {
  const { expenses, isLoaded, deleteExpense } = useFinances()
  const fmt = useFormatCurrency()
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const filtered = filter === 'all' ? expenses : expenses.filter(e => e.category === filter)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const handleDelete = (id: string) => {
    if (confirmingId === id) {
      deleteExpense(id)
      setConfirmingId(null)
    } else {
      setConfirmingId(id)
    }
  }

  if (!isLoaded) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <ListSkeleton rows={6} />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Expenses</h1>
        <p className="text-muted-foreground text-sm mt-1">Track and categorize every transaction in your history.</p>
        <p className="text-muted-foreground text-sm mt-0.5">
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} &middot; {fmt(filtered.reduce((s, e) => s + e.amount, 0))}
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
        >
          All
        </Button>
        {CATEGORIES.map(c => (
          <Button
            key={c.value}
            variant={filter === c.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(c.value)}
            className={`shrink-0 ${filter === c.value ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
          >
            {c.label}
          </Button>
        ))}
      </div>

      {/* Expense list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              No expenses found. Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs font-mono">C</kbd> to add one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="space-y-2">
              {filtered
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(expense => {
                  const isConfirming = confirmingId === expense.id
                  return (
                    <Card key={expense.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: CATEGORIES.find(c => c.value === expense.category)?.color }}
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">{expense.description}</p>
                              <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                                <span className="capitalize">{expense.category}</span>
                                <span>&middot;</span>
                                <span>{formatDate(expense.date)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <p className="text-sm font-bold text-foreground">{fmt(expense.amount)}</p>
                            {isConfirming ? (
                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(expense.id)}
                                  className="h-7 text-xs px-2.5"
                                >
                                  Confirm
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setConfirmingId(null)}
                                  className="h-7 text-xs px-2"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onEditExpense?.(expense)}
                                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 h-8 w-8"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(expense.id)}
                                  className="text-muted-foreground hover:text-destructive h-8 w-8"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </div>

          {/* Mobile stacked cards */}
          <div className="md:hidden space-y-3">
            {filtered
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(expense => {
                const catInfo = CATEGORIES.find(c => c.value === expense.category)
                const isConfirming = confirmingId === expense.id
                return (
                  <Card key={expense.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{expense.description}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(expense.date)}</p>
                        </div>
                        <p className="text-lg font-bold text-foreground shrink-0">
                          {fmt(expense.amount)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{ backgroundColor: (catInfo?.color || '#6b7280') + '18', color: catInfo?.color }}
                        >
                          {catInfo?.label || expense.category}
                        </span>
                        {isConfirming ? (
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(expense.id)}
                              className="h-7 text-xs px-2.5"
                            >
                              Confirm Delete
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmingId(null)}
                              className="h-7 text-xs px-2"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditExpense?.(expense)}
                              className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 h-7 px-2 text-xs"
                            >
                              <Pencil className="w-3 h-3 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(expense.id)}
                              className="text-muted-foreground hover:text-destructive h-7 px-2 text-xs"
                            >
                              <Trash2 className="w-3 h-3 mr-1" /> Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </>
      )}
    </div>
  )
}
