'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function RegisterPage() {
    const { register } = useAuth()
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Force light mode on auth pages
    useEffect(() => {
        const html = document.documentElement
        const wasDark = html.classList.contains('dark')
        if (wasDark) html.classList.remove('dark')
        return () => { if (wasDark) html.classList.add('dark') }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setLoading(true)
        await new Promise(r => setTimeout(r, 400))

        const result = register(name, email, password)
        if (result.success) {
            router.push('/')
        } else {
            setError(result.error || 'Something went wrong')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-dvh flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-2xl mb-4 shadow-lg shadow-emerald-600/20">
                        <DollarSign className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
                    <p className="text-muted-foreground text-sm mt-1">Start tracking your finances with FinanceFlow</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-foreground block mb-1.5">Name</label>
                            <Input
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="h-11"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground block mb-1.5">Password</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min. 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="h-11 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground block mb-1.5">Confirm Password</label>
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...
                            </>
                        ) : (
                            'Create account'
                        )}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    )
}
