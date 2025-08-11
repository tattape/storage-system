import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from './src/utils/verifyIdToken';

const PUBLIC_PATHS = ["/login", "/api", "/_next", "/favicon.ico", "/public"];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    // Allow public paths
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    const token = req.cookies.get('token')?.value;
    if (!token) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = '/login';
        return NextResponse.redirect(loginUrl);
    }

    // Optional: verify token (for extra security)
    try {
        await verifyIdToken(token);
    } catch {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = '/login';
        return NextResponse.redirect(loginUrl);
    }

    // If user is on /login and already logged in, redirect to dashboard
    if (pathname === '/login') {
        const dashUrl = req.nextUrl.clone();
        dashUrl.pathname = '/dashboard';
        return NextResponse.redirect(dashUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next|api|favicon.ico|public).*)"
    ]
};
