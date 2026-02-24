'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
    value: string
    label: string
    color?: string
}

interface CustomSelectProps {
    value: string
    onChange: (value: string) => void
    options: SelectOption[]
    placeholder?: string
    className?: string
    highlight?: boolean
}

export default function CustomSelect({ value, onChange, options, placeholder, className, highlight }: CustomSelectProps) {
    const [open, setOpen] = useState(false)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return
        const rect = triggerRef.current.getBoundingClientRect()
        setMenuStyle({
            position: 'fixed',
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
        })
    }, [])

    useEffect(() => {
        if (!open) return

        updatePosition()

        function handleClickOutside(e: MouseEvent) {
            if (
                triggerRef.current?.contains(e.target as Node) ||
                menuRef.current?.contains(e.target as Node)
            ) return
            setOpen(false)
        }
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false)
        }
        function handleScroll() {
            updatePosition()
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
        window.addEventListener('scroll', handleScroll, true)
        window.addEventListener('resize', updatePosition)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
            window.removeEventListener('scroll', handleScroll, true)
            window.removeEventListener('resize', updatePosition)
        }
    }, [open, updatePosition])

    const selected = options.find(o => o.value === value)

    const menu = open ? (
        <div
            ref={menuRef}
            style={menuStyle}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100"
        >
            <div className="max-h-56 overflow-y-auto py-1">
                {options.map(option => {
                    const isSelected = option.value === value
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => { onChange(option.value); setOpen(false) }}
                            className={cn(
                                'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                                isSelected
                                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium'
                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700',
                            )}
                        >
                            {option.color && (
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: option.color }} />
                            )}
                            {option.label}
                        </button>
                    )
                })}
            </div>
        </div>
    ) : null

    return (
        <div className={cn('relative', className)}>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen(!open)}
                className={cn(
                    'w-full h-9 px-3 rounded-md border border-input bg-transparent text-foreground text-sm flex items-center justify-between gap-2 text-left transition-colors',
                    'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                    highlight && 'ring-1 ring-emerald-500/40',
                )}
            >
                <span className="flex items-center gap-2 truncate">
                    {selected?.color && (
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: selected.color }} />
                    )}
                    {selected?.label || placeholder || 'Select...'}
                </span>
                <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform', open && 'rotate-180')} />
            </button>

            {typeof document !== 'undefined' && menu && createPortal(menu, document.body)}
        </div>
    )
}
