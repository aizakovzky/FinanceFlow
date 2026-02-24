'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useFinances, useFormatCurrency, type Category, type Expense, CATEGORIES } from '@/hooks/use-finances'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Sparkles, Plus, Wand2, Pencil } from 'lucide-react'
import CustomSelect from '@/components/custom-select'

interface QuickAddProps {
  open: boolean
  onClose: () => void
  editingExpense?: Expense | null
}

function parseNaturalLanguage(text: string): {
  amount: number | null
  category: Category
  description: string
  date: string
} {
  const today = new Date().toISOString().split('T')[0]
  let amount: number | null = null
  let category: Category = 'other'
  const description = text.trim()

  const amountPatterns = [
    /\$\s?([\d,]+(?:\.\d{1,2})?)/,
    /(?:spent|paid|cost|was|for)\s+\$?([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:dollars|usd|bucks)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:euros?|eur)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:pounds?|gbp)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:yen|jpy)/i,
    /^\s*([\d,]+(?:\.\d{1,2})?)\s/,
    /([\d,]+(?:\.\d{1,2})?)/,
  ]
  for (const pattern of amountPatterns) {
    const match = text.match(pattern)
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, ''))
      break
    }
  }

  const categoryKeywords: Record<Category, string[]> = {
    food: ['food', 'lunch', 'dinner', 'breakfast', 'coffee', 'restaurant', 'ramen', 'pizza', 'grocery', 'groceries', 'eat', 'meal', 'snack', 'cafe', 'drink', 'beer', 'wine'],
    transport: ['uber', 'lyft', 'taxi', 'bus', 'train', 'subway', 'gas', 'fuel', 'parking', 'toll', 'flight', 'travel', 'ride'],
    entertainment: ['movie', 'game', 'concert', 'netflix', 'spotify', 'subscription', 'ticket', 'show', 'museum', 'book'],
    utilities: ['electricity', 'electric', 'water', 'internet', 'wifi', 'phone', 'bill', 'rent', 'insurance', 'utility'],
    shopping: ['amazon', 'clothes', 'clothing', 'shoes', 'shirt', 'purchase', 'bought', 'store', 'shop', 'online'],
    healthcare: ['doctor', 'hospital', 'pharmacy', 'medicine', 'medical', 'dentist', 'health', 'gym', 'fitness'],
    income: ['salary', 'income', 'earned', 'received', 'freelance', 'payment received', 'paycheck'],
    other: [],
  }
  const lower = text.toLowerCase()
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(k => lower.includes(k))) {
      category = cat as Category
      break
    }
  }

  let date = today
  if (lower.includes('yesterday')) {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    date = d.toISOString().split('T')[0]
  } else if (lower.includes('last week')) {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    date = d.toISOString().split('T')[0]
  }

  return { amount, category, description, date }
}

export default function QuickAddModal({ open, onClose, editingExpense }: QuickAddProps) {
  const { addExpense, updateExpense } = useFinances()
  const fmt = useFormatCurrency()
  const isEditing = !!editingExpense

  const [nlInput, setNlInput] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('other')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [autoFilled, setAutoFilled] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      if (editingExpense) {
        // Pre-fill for editing
        setNlInput('')
        setAmount(editingExpense.amount.toString())
        setCategory(editingExpense.category)
        setDate(editingExpense.date)
        setDescription(editingExpense.description)
        setAutoFilled(false)
      } else {
        // Reset for new transaction
        setNlInput('')
        setAmount('')
        setCategory('other')
        setDate(new Date().toISOString().split('T')[0])
        setDescription('')
        setAutoFilled(false)
      }
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, editingExpense])

  const handleNlChange = useCallback((value: string) => {
    setNlInput(value)
    if (value.trim().length > 2) {
      const parsed = parseNaturalLanguage(value)
      if (parsed.amount !== null) setAmount(parsed.amount.toString())
      setCategory(parsed.category)
      setDate(parsed.date)
      setDescription(parsed.description)
      setAutoFilled(true)
    } else {
      setAutoFilled(false)
    }
  }, [])

  const handleSubmit = () => {
    const finalAmount = parseFloat(amount)
    const finalDesc = description || nlInput.trim()
    if (!finalAmount || finalAmount <= 0 || !finalDesc) return

    if (isEditing && editingExpense) {
      updateExpense(editingExpense.id, {
        amount: finalAmount,
        description: finalDesc,
        category,
        date,
      })
    } else {
      addExpense({
        amount: finalAmount,
        description: finalDesc,
        category,
        date,
      })
    }
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Pencil className="w-4 h-4 text-blue-500" />
            ) : (
              <Sparkles className="w-4 h-4 text-emerald-500" />
            )}
            <span className="font-semibold text-foreground text-sm">
              {isEditing ? 'Edit Transaction' : 'New Transaction'}
            </span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* NLP area — hidden when editing */}
          {!isEditing && (
            <>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  <Wand2 className="w-3.5 h-3.5" /> Describe your transaction
                </label>
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={nlInput}
                    onChange={e => handleNlChange(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
                    placeholder={'Type what you spent...\ne.g. "Spent $25 on lunch at the cafe yesterday"'}
                    className="w-full min-h-[80px] resize-none rounded-xl bg-muted border-0 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm leading-relaxed"
                    rows={3}
                  />
                </div>
                {autoFilled && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Fields below have been auto-filled from your text
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">or fill in manually</span>
                </div>
              </div>
            </>
          )}

          {/* Standard form fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setAutoFilled(false) }}
                  className={autoFilled && amount ? 'ring-1 ring-emerald-500/40' : ''}
                  ref={isEditing ? (inputRef as unknown as React.Ref<HTMLInputElement>) : undefined}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={e => { setDate(e.target.value); setAutoFilled(false) }}
                  className={autoFilled && date !== new Date().toISOString().split('T')[0] ? 'ring-1 ring-emerald-500/40' : ''}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Category</label>
              <CustomSelect
                value={category}
                onChange={v => { setCategory(v as Category); setAutoFilled(false) }}
                options={CATEGORIES.filter(c => c.value !== 'income').map(c => ({ value: c.value, label: c.label, color: c.color }))}
                highlight={autoFilled && category !== 'other'}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Description</label>
              <Input
                type="text"
                placeholder="e.g., Lunch at restaurant"
                value={description}
                onChange={e => { setDescription(e.target.value); setAutoFilled(false) }}
                className={autoFilled && description ? 'ring-1 ring-emerald-500/40' : ''}
              />
            </div>
          </div>

          {/* Preview */}
          {parseFloat(amount) > 0 && (
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORIES.find(c => c.value === category)?.color || '#6b7280' }}
                  />
                  <span className="text-sm text-foreground font-medium truncate">
                    {description || nlInput.trim() || 'Transaction'}
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 shrink-0 ml-2">
                  {fmt(parseFloat(amount))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs font-mono">Enter</kbd> to save
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!parseFloat(amount) || !(description || nlInput.trim())}
            className={isEditing
              ? 'bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 text-sm'
            }
          >
            {isEditing ? (
              <><Pencil className="w-3.5 h-3.5 mr-1.5" /> Update Transaction</>
            ) : (
              <><Plus className="w-3.5 h-3.5 mr-1.5" /> Add Transaction</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
