import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET })

    const { pathname } = request.nextUrl

    // Allow access to auth pages and API routes
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/api/auth')
    ) {
        // If logged in and trying to access login/register, redirect to home
        if (token && (pathname === '/login' || pathname === '/register')) {
            return NextResponse.redirect(new URL('/', request.url))
        }
        return NextResponse.next()
    }

    // Redirect unauthenticated users to login
    if (!token) {
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico, icon*, apple-icon* (icons)
         * - api routes (except api/auth which is handled above)
         */
        '/((?!_next/static|_next/image|favicon\\.ico|icon|apple-icon|api/).*)',
        '/api/auth/:path*',
    ],
}
