import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const budgets = await prisma.budget.findMany({
        where: { userId: session.user.id },
    })

    return NextResponse.json(budgets)
}

export async function PUT(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id, limit } = await req.json()

        if (!id || limit === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const budget = await prisma.budget.findFirst({
            where: { id, userId: session.user.id },
        })

        if (!budget) {
            return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
        }

        const updated = await prisma.budget.update({
            where: { id },
            data: { limit: parseFloat(limit) },
        })

        return NextResponse.json(updated)
    } catch {
        return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 })
    }
}
