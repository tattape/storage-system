import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from './src/utils/verifyIdToken';

const PUBLIC_PATHS = ["/login", "/api", "/_next", "/favicon.ico", "/public"];
const OWNER_ONLY_PATHS = ["/cleanup"];

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

    // Verify token
    try {
        const decodedToken = await verifyIdToken(token);
        
        // Check if path requires owner role
        if (OWNER_ONLY_PATHS.some(path => pathname.startsWith(path))) {
            // For owner-only paths, we'll let the client-side check handle it
            // since we don't have user role in the JWT token
            // The ProtectedLayout will handle the role check
        }
        
    } catch {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = '/login';
        return NextResponse.redirect(loginUrl);
    }

    // If user is on /login and already logged in, redirect to home
    if (pathname === '/login') {
        const homeUrl = req.nextUrl.clone();
        homeUrl.pathname = '/home';
        return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next|api|favicon.ico|public).*)"
    ]
};
