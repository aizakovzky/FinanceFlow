'use client'

import { useMemo } from 'react'
import { useFinances, useFormatCurrency, getExpensesByMonth, getSpendingByCategory, getMonthlyTrend, getBudgetSpending, CATEGORIES } from '@/hooks/use-finances'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import ChartTooltip from '@/components/chart-tooltip'
import { AlertTriangle, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react'
import { CardSkeleton, ChartSkeleton } from '@/components/skeleton-loaders'

export default function AnalyticsPage() {
  const { expenses, budgets, isLoaded } = useFinances()
  const fmt = useFormatCurrency()

  const now = useMemo(() => new Date(), [])
  const monthlyExpenses = useMemo(() => getExpensesByMonth(expenses, now), [expenses, now])
  const monthlyTotal = useMemo(() => monthlyExpenses.reduce((s, e) => s + e.amount, 0), [monthlyExpenses])
  const categorySpending = useMemo(() => getSpendingByCategory(monthlyExpenses), [monthlyExpenses])
  const trend = useMemo(() => getMonthlyTrend(expenses, 6), [expenses])

  const categoryData = useMemo(() => {
    return Object.entries(categorySpending)
      .filter(([, a]) => a > 0)
      .map(([cat, amount]) => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        value: amount,
        color: CATEGORIES.find(c => c.value === cat)?.color || '#6b7280',
      }))
      .sort((a, b) => b.value - a.value)
  }, [categorySpending])

  const avgData = useMemo(() => {
    const byCat: Record<string, { total: number; count: number }> = {}
    monthlyExpenses.forEach(e => {
      if (!byCat[e.category]) byCat[e.category] = { total: 0, count: 0 }
      byCat[e.category].total += e.amount
      byCat[e.category].count++
    })
    return Object.entries(byCat).map(([cat, { total, count }]) => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      average: Math.round((total / count) * 100) / 100,
    }))
  }, [monthlyExpenses])

  // Proactive insights
  const insights = useMemo(() => {
    const msgs: { type: 'warning' | 'info' | 'success'; text: string }[] = []
    const dayOfMonth = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysRemaining = daysInMonth - dayOfMonth

    budgets.forEach(b => {
      const spent = getBudgetSpending(b.category, monthlyExpenses)
      const pct = b.limit > 0 ? spent / b.limit : 0

      if (pct >= 1) {
        msgs.push({ type: 'warning', text: `You've exceeded your ${b.category} budget by ${fmt(spent - b.limit)}.` })
      } else if (pct > 0.5 && dayOfMonth < daysInMonth * 0.5) {
        const dailyRate = spent / dayOfMonth
        const projected = dailyRate * daysInMonth
        if (projected > b.limit) {
          const daysUntilOver = Math.round((b.limit - spent) / dailyRate)
          msgs.push({ type: 'warning', text: `At your current rate, you will exceed your ${b.category} budget in ${daysUntilOver} day${daysUntilOver !== 1 ? 's' : ''}.` })
        }
      } else if (pct > 0.8) {
        msgs.push({ type: 'info', text: `Your ${b.category} budget is ${Math.round(pct * 100)}% spent with ${daysRemaining} days remaining.` })
      }
    })

    if (monthlyTotal > 0 && trend.length >= 2) {
      const prevMonth = trend[trend.length - 2].amount
      if (prevMonth > 0) {
        const change = ((monthlyTotal - prevMonth) / prevMonth) * 100
        if (change > 20) {
          msgs.push({ type: 'info', text: `Spending is up ${Math.round(change)}% compared to last month.` })
        } else if (change < -10) {
          msgs.push({ type: 'success', text: `Spending is down ${Math.abs(Math.round(change))}% compared to last month.` })
        }
      }
    }

    if (msgs.length === 0 && monthlyTotal === 0) {
      msgs.push({ type: 'info', text: 'Start adding expenses to see personalized insights and forecasts.' })
    }

    return msgs
  }, [budgets, monthlyExpenses, monthlyTotal, now, trend])

  if (!isLoaded) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton /><ChartSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Insights into your spending patterns</p>
      </div>

      {/* Proactive Insights */}
      {insights.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Proactive Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 text-sm px-3 py-2.5 rounded-lg ${insight.type === 'warning'
                    ? 'bg-red-500/10 text-red-700 dark:text-red-400'
                    : insight.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
              >
                {insight.type === 'warning' && <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
                {insight.type === 'success' && <TrendingDown className="w-4 h-4 mt-0.5 shrink-0" />}
                {insight.type === 'info' && <TrendingUp className="w-4 h-4 mt-0.5 shrink-0" />}
                <span>{insight.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{fmt(monthlyTotal)}</p>
            <p className="text-xs text-muted-foreground mt-1">{monthlyExpenses.length} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {fmt(monthlyExpenses.length > 0 ? monthlyTotal / monthlyExpenses.length : 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{categoryData[0]?.name || 'N/A'}</p>
            <p className="text-xs text-muted-foreground mt-1">{categoryData[0] ? fmt(categoryData[0].value) : ''}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spending by Category</CardTitle>
            <CardDescription>This month&apos;s breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" paddingAngle={2}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip fmt={fmt} />} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {categoryData.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {categoryData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Trend</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip content={<ChartTooltip fmt={fmt} />} />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Average by category */}
      {avgData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Average by Category</CardTitle>
            <CardDescription>Average transaction amount this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={avgData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="category" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip content={<ChartTooltip fmt={fmt} />} />
                <Bar dataKey="average" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
