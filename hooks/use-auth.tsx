'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import {
    type LocalUser,
    registerUser as doRegister,
    loginUser as doLogin,
    getCurrentUser,
    logout as doLogout,
} from '@/lib/local-auth'
import { seedDemoData } from '@/lib/seed-data'

interface AuthContextType {
    user: LocalUser | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => { success: boolean; error?: string }
    register: (name: string, email: string, password: string) => { success: boolean; error?: string }
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<LocalUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        seedDemoData()
        const saved = getCurrentUser()
        setUser(saved)
        setIsLoading(false)
    }, [])

    const login = useCallback((email: string, password: string) => {
        const result = doLogin(email, password)
        if (result.success) {
            setUser(result.user)
            return { success: true }
        }
        return { success: false, error: result.error }
    }, [])

    const register = useCallback((name: string, email: string, password: string) => {
        const result = doRegister(name, email, password)
        if (result.success) {
            setUser(result.user)
            return { success: true }
        }
        return { success: false, error: result.error }
    }, [])

    const logout = useCallback(() => {
        doLogout()
        setUser(null)
    }, [])

    return (
        <AuthContext value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout,
        }}>
            {children}
        </AuthContext>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
    return ctx
}
