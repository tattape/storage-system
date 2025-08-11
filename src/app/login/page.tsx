"use client";
import { Card, Button, Input, Spinner } from "@heroui/react";
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (e) {
            setError("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
            <Card className="w-full max-w-md p-8 shadow-xl rounded-2xl flex flex-col items-center">
                <h1 className="text-2xl font-bold mb-6 text-blue-700">Storage System Login</h1>
                <Button
                    onClick={handleLogin}
                    color="primary"
                    size="lg"
                    className="w-full flex items-center justify-center"
                    disabled={loading}
                >
                    {loading ? <Spinner size="sm" color="primary" className="mr-2" /> : null}
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
