'use client'

import { useState } from 'react'
import { useFinances, useFormatCurrency, type Category, CATEGORIES } from '@/hooks/use-finances'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus } from 'lucide-react'
import CustomSelect from '@/components/custom-select'
import { ListSkeleton } from '@/components/skeleton-loaders'

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

export default function RecurringPage() {
  const { recurring, isLoaded, addRecurring, deleteRecurring } = useFinances()
  const fmt = useFormatCurrency()
  const [showForm, setShowForm] = useState(false)

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('utilities')
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [nextDate, setNextDate] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description) return

    addRecurring({
      amount: parseFloat(amount),
      description,
      category,
      type,
      frequency,
      nextDate,
    })

    setAmount('')
    setDescription('')
    setCategory('utilities')
    setType('expense')
    setFrequency('monthly')
    setNextDate(new Date().toISOString().split('T')[0])
    setShowForm(false)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const totalMonthly = recurring.reduce((sum, t) => {
    const mult: Record<string, number> = { daily: 30, weekly: 4.3, monthly: 1, yearly: 1 / 12 }
    return sum + t.amount * (mult[t.frequency] || 1)
  }, 0)

  if (!isLoaded) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <ListSkeleton rows={4} />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Recurring</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your automated bills and subscription cycles.</p>
          <p className="text-muted-foreground text-sm mt-0.5">Monthly impact: {fmt(totalMonthly)}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Recurring
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Recurring Transaction</CardTitle>
            <CardDescription>Set up automated entries</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Type</label>
                  <CustomSelect
                    value={type}
                    onChange={v => setType(v as 'expense' | 'income')}
                    options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Frequency</label>
                  <CustomSelect
                    value={frequency}
                    onChange={v => setFrequency(v as typeof frequency)}
                    options={FREQUENCIES.map(f => ({ value: f.value, label: f.label }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Amount</label>
                  <Input type="number" placeholder="0.00" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Category</label>
                  <CustomSelect
                    value={category}
                    onChange={v => setCategory(v as Category)}
                    options={CATEGORIES.map(c => ({ value: c.value, label: c.label, color: c.color }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Description</label>
                <Input type="text" placeholder="e.g., Monthly gym membership" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Next Date</label>
                <Input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)} />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Add</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {recurring.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">No recurring transactions yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {recurring.sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime()).map(t => {
            const catInfo = CATEGORIES.find(c => c.value === t.category)
            return (
              <Card key={t.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: catInfo?.color }} />
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{t.description}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                          <span className="capitalize">{t.category}</span>
                          <span>&middot;</span>
                          <span className="capitalize">{t.frequency}</span>
                          <span>&middot;</span>
                          <span>Next: {formatDate(t.nextDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                      </p>
                      <Button variant="ghost" size="icon" onClick={() => deleteRecurring(t.id)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
