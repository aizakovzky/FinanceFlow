import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'

const DEFAULT_BUDGETS = [
    { category: 'food', limit: 500 },
    { category: 'transport', limit: 500 },
    { category: 'entertainment', limit: 500 },
    { category: 'utilities', limit: 500 },
    { category: 'shopping', limit: 500 },
    { category: 'healthcare', limit: 500 },
]

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
        }

        const hashedPassword = await hash(password, 12)
        const user = await prisma.user.create({
            data: {
                email,
                name: name || null,
                hashedPassword,
                budgets: {
                    create: DEFAULT_BUDGETS,
                },
            },
        })

        return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}
