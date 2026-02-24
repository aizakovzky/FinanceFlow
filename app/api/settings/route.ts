import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { currency: true },
    })

    return NextResponse.json({ currency: user?.currency || 'USD' })
}

export async function PUT(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { currency } = await req.json()

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: { currency },
        })

        return NextResponse.json({ currency: user.currency })
    } catch {
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }
}
