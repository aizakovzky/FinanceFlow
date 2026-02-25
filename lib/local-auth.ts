'use client'

// ── LocalStorage-based auth for the browser-only demo ──

export interface LocalUser {
    id: string
    name: string
    email: string
    passwordHash: string
    createdAt: string
}

const USERS_KEY = 'ff_users'
const SESSION_KEY = 'ff_current_session'

// Simple obfuscation (NOT real security — demo only)
function hashPassword(password: string): string {
    return btoa(password + '::ff_salt')
}

function verifyPassword(password: string, hash: string): boolean {
    return hashPassword(password) === hash
}

function getUsers(): LocalUser[] {
    if (typeof window === 'undefined') return []
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    } catch {
        return []
    }
}

function saveUsers(users: LocalUser[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function registerUser(
    name: string,
    email: string,
    password: string
): { success: true; user: LocalUser } | { success: false; error: string } {
    const users = getUsers()

    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'An account with this email already exists.' }
    }
    if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' }
    }

    const user: LocalUser = {
        id: crypto.randomUUID(),
        name,
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
    }

    saveUsers([...users, user])
    setCurrentUser(user)
    return { success: true, user }
}

export function loginUser(
    email: string,
    password: string
): { success: true; user: LocalUser } | { success: false; error: string } {
    const users = getUsers()
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
        return { success: false, error: 'No account found with this email.' }
    }
    if (!verifyPassword(password, user.passwordHash)) {
        return { success: false, error: 'Incorrect password.' }
    }

    setCurrentUser(user)
    return { success: true, user }
}

export function getCurrentUser(): LocalUser | null {
    if (typeof window === 'undefined') return null
    try {
        const raw = localStorage.getItem(SESSION_KEY)
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

export function setCurrentUser(user: LocalUser) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function logout() {
    localStorage.removeItem(SESSION_KEY)
}

export function hasAnyUsers(): boolean {
    return getUsers().length > 0
}
