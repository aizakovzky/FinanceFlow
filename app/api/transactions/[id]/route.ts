import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    const transaction = await prisma.transaction.findFirst({
        where: { id, userId: session.user.id },
    })

    if (!transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const updated = await prisma.transaction.update({
        where: { id },
        data: {
            amount: body.amount ?? transaction.amount,
            description: body.description ?? transaction.description,
            category: body.category ?? transaction.category,
            date: body.date ? new Date(body.date) : transaction.date,
        },
    })

    return NextResponse.json(updated)
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const transaction = await prisma.transaction.findFirst({
        where: { id, userId: session.user.id },
    })

    if (!transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    await prisma.transaction.delete({ where: { id } })

    return NextResponse.json({ success: true })
}

