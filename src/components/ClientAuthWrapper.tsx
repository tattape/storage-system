"use client";
import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Spinner } from '@heroui/react';
import { getUserByEmail } from '../services/users';
import { useGlobalErrorHandler } from '../hooks/useGlobalErrorHandler';

interface ClientAuthWrapperProps {
    children: ReactNode;
}

export default function ClientAuthWrapper({ children }: ClientAuthWrapperProps) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Setup global error handler for 401 responses
    useGlobalErrorHandler();

    useEffect(() => {
        // Skip auth check for public routes
        const publicRoutes = ['/', '/login'];
        if (publicRoutes.includes(pathname)) {
            console.log('✅ ClientAuthWrapper: Public route, allowing access:', pathname);
            setAuthorized(true);
            setLoading(false);
            return;
        }

        console.log('🔍 ClientAuthWrapper: Checking auth for protected route:', pathname);

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                // No user, redirect to login
                console.log('🔒 ClientAuthWrapper: No Firebase user, redirecting to login');
                router.replace('/login');
                return;
            }

            console.log('✅ ClientAuthWrapper: Firebase user found:', firebaseUser.email);

            // Check if this is an owner-only route
            if (pathname.startsWith('/cleanup')) {
                console.log('🔍 ClientAuthWrapper: Checking owner role for cleanup route');
                // Get user role from database
                try {
                    const user = await getUserByEmail(firebaseUser.email!);
                    
                    if (!user || user.role !== 'owner') {
                        // Not owner, redirect to dashboard
                        console.log('🔒 ClientAuthWrapper: User is not owner, redirecting to dashboard');
                        router.replace('/dashboard');
                        return;
                    }
                    console.log('✅ ClientAuthWrapper: Owner access granted for cleanup');
                } catch (error) {
                    console.error('❌ ClientAuthWrapper: Error checking user role:', error);
                    router.replace('/dashboard');
                    return;
                }
            }

            // User is authenticated and authorized, allow access
            console.log('✅ ClientAuthWrapper: Access granted for:', pathname);
            setAuthorized(true);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router, pathname]);

    // Show loading spinner while checking auth for protected routes
    const publicRoutes = ['/', '/login'];
    if (loading && !publicRoutes.includes(pathname)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600">
                <div className="text-center">
                    <Spinner size="lg" color="white" />
                    <p className="text-white mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    // Show nothing if not authorized (redirect is happening)
    if (!authorized && !publicRoutes.includes(pathname)) {
        return null;
    }

    // User is authorized or on public route, render children
    return <>{children}</>;
}
