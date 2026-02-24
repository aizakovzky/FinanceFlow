import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const recurring = await prisma.recurringTransaction.findMany({
        where: { userId: session.user.id },
    })

    return NextResponse.json(recurring)
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await req.json()
        const { amount, description, category, frequency, nextDate, type } = body

        if (!amount || !description || !category || !frequency || !nextDate || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const transaction = await prisma.recurringTransaction.create({
            data: {
                amount: parseFloat(amount),
                description,
                category,
                frequency,
                nextDate: new Date(nextDate),
                type,
                userId: session.user.id,
            },
        })

        return NextResponse.json(transaction, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'Failed to create recurring transaction' }, { status: 500 })
    }
}
