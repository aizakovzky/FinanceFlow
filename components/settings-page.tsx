'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useFinances, useFormatCurrency, CURRENCIES, type CurrencyCode, type Expense } from '@/hooks/use-finances'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Download, Upload, Trash2, Shield, HardDrive, Globe, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const { logout } = useAuth()
  const { expenses, budgets, recurring, currency, setCurrency, clearAllData, importExpenses } = useFinances()
  const fmt = useFormatCurrency()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleExportJSON = () => {
    const data = {
      exported: new Date().toISOString(),
      expenses,
      budgets,
      recurring,
      currency,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `financeflow-backup-${new Date().toISOString().split('T')[0]}.json`)
  }

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount']
    const rows = [...expenses]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(e => [e.date, `"${e.description.replace(/"/g, '""')}"`, e.category, e.amount.toFixed(2)])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    downloadBlob(new Blob([csv], { type: 'text/csv' }), `financeflow-expenses-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        const lines = text.trim().split('\n')
        if (lines.length < 2) { setImportMsg('CSV file is empty.'); return }

        const imported: Omit<Expense, 'id'>[] = []
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].match(/(\".*?\"|[^",]+)(?=\s*,|\s*$)/g)
          if (!parts || parts.length < 4) continue
          imported.push({
            date: parts[0].replace(/"/g, '').trim(),
            description: parts[1].replace(/"/g, '').trim(),
            category: parts[2].replace(/"/g, '').trim() as Expense['category'],
            amount: parseFloat(parts[3].replace(/"/g, '').trim()),
          })
        }

        importExpenses(imported)
        setImportMsg(`Successfully imported ${imported.length} transactions.`)
      } catch {
        setImportMsg('Failed to parse CSV file.')
      }
    }
    reader.readAsText(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedCurrencyInfo = CURRENCIES.find(c => c.code === currency)

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure your currency, export data, and manage account security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Localization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4" /> Localization
            </CardTitle>
            <CardDescription>Set your preferred currency for all displays</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Default Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as CurrencyCode)}
                className="w-full h-10 px-3 rounded-md border border-input bg-card text-foreground text-sm"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} - {c.label} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preview</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Example amount</span>
                <span className="font-semibold text-foreground">{fmt(1234.56)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Large amount</span>
                <span className="font-semibold text-foreground">{fmt(99999)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Formatting follows {selectedCurrencyInfo?.label || currency} locale conventions via Intl.NumberFormat.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HardDrive className="w-4 h-4" /> Data Management
            </CardTitle>
            <CardDescription>{expenses.length} transactions recorded</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button onClick={handleExportCSV} variant="outline" className="justify-start">
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
              <Button onClick={handleExportJSON} variant="outline" className="justify-start">
                <Download className="w-4 h-4 mr-2" /> Export JSON Backup
              </Button>
              <Button onClick={() => fileRef.current?.click()} variant="outline" className="justify-start">
                <Upload className="w-4 h-4 mr-2" /> Import CSV
              </Button>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
              {importMsg && (
                <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">{importMsg}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-muted-foreground text-xs">App</p>
              <p className="font-medium text-foreground">FinanceFlow</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Version</p>
              <p className="font-medium text-foreground">3.0.0</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Currency</p>
              <p className="font-medium text-foreground">{currency}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Transactions</p>
              <p className="font-medium text-foreground">{expenses.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" /> Privacy & Security
          </CardTitle>
          <CardDescription>Your data is secured</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <p>Data is stored securely on the server</p>
            <p>Your account is protected by a hashed password</p>
            <p>Each user&apos;s data is fully isolated</p>
            <p>Full control to export or delete at any time</p>
          </div>
        </CardContent>
      </Card>

      {/* Account actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sign out */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => signOut({ callbackUrl: '/login' })} variant="outline">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" /> Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showConfirmation ? (
              <Button onClick={() => setShowConfirmation(true)} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Clear All Data
              </Button>
            ) : (
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  This will permanently delete all your transactions. Export first!
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowConfirmation(false)}>Cancel</Button>
                  <Button onClick={() => { clearAllData(); setShowConfirmation(false) }} className="bg-red-600 hover:bg-red-700 text-white">
                    Delete Everything
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
