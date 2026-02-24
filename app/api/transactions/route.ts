import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const transactions = await prisma.transaction.findMany({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' },
    })

    return NextResponse.json(transactions)
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await req.json()
        const { amount, description, category, date, recurring, recurringId } = body

        if (!amount || !description || !category || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                description,
                category,
                date: new Date(date),
                recurring: recurring || false,
                recurringId: recurringId || null,
                userId: session.user.id,
            },
        })

        return NextResponse.json(transaction, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
    }
}
