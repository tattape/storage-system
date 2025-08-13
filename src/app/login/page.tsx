"use client";
import { Card, Button } from "@heroui/react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useState, useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [checking, setChecking] = useState(true);
    const router = useRouter();

    // Check if user is already logged in
    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('/api/session', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    // User has valid session, redirect to home
                    router.replace("/home");
                } else {
                    // No valid session, show login page
                    setChecking(false);
                }
            } catch {
                // Error checking session, show login page
                setChecking(false);
            }
        };

        checkSession();
    }, [router]);

    const handleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            if (result.user) {
                // Get ID token and set session
                const idToken = await result.user.getIdToken();

                // Send token to session API
                const response = await fetch('/api/session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: idToken }),
                });

                if (response.ok) {
                    // Redirect after successful session creation
                    router.push("/home");
                } else {
                    setError("Failed to create session. Please try again.");
                }
            }
        } catch {
            setError("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Show loading while checking authentication
    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-100 to-secondary-300">
                <LoadingSpinner size="lg" color="secondary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-100 to-secondary-300 p-4">
            <Card className="w-full max-w-md p-8 shadow-xl rounded-2xl flex flex-col items-center">
                <h1 className="text-2xl font-bold mb-6 text-secondary-700">Storage System Login</h1>
                <Button
                    onClick={handleLogin}
                    color="primary"
                    size="lg"
                    className="w-full flex items-center justify-center"
                    disabled={loading}
                >
                    {loading ? <LoadingSpinner size="sm" color="secondary" className="mr-2" /> : null}
                    Login with Google
                </Button>
                {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
                <div className="mt-8 text-gray-400 text-xs text-center w-full">
                    &copy; {new Date().getFullYear()} Storage System. All rights reserved.
                </div>
            </Card>
        </div>
    );
}
