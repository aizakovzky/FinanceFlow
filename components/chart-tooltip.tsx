'use client'

import type { TooltipProps } from 'recharts'

interface ChartTooltipProps extends TooltipProps<number, string> {
    fmt?: (value: number) => string
}

export default function ChartTooltip({ active, payload, label, fmt }: ChartTooltipProps) {
    if (!active || !payload?.length) return null

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 text-sm">
            {label && (
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1 font-medium">{label}</p>
            )}
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color || entry.payload?.color || '#6b7280' }}
                    />
                    <span className="text-gray-700 dark:text-gray-200 font-medium">
                        {entry.name && <span className="mr-1.5">{entry.name}:</span>}
                        <span className="text-gray-900 dark:text-gray-100 font-semibold">
                            {fmt ? fmt(entry.value as number) : entry.value}
                        </span>
                    </span>
                </div>
            ))}
        </div>
    )
}
