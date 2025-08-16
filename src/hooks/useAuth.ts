import { useState, useEffect } from "react";
import { getUserByEmail, User } from "../services/users";

interface SessionData {
    email: string;
    uid: string;
}

export function useAuth() {
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [userRole, setUserRole] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            try {
                setError(null);
                
                // Get session from API
                const response = await fetch('/api/session', {
                    method: 'GET',
                    credentials: 'include',
                });
                
                if (response.ok) {
                    const sessionDataResponse = await response.json();
                    setSessionData(sessionDataResponse);
                    
                    if (sessionDataResponse?.email) {
                        // Get user role from Firestore by email
                        const userData = await getUserByEmail(sessionDataResponse.email);
                        setUserRole(userData);
                        
                        if (!userData) {
                            setError("User not found in system");
                        }
                    } else {
                        setUserRole(null);
                    }
                } else {
                    setSessionData(null);
                    setUserRole(null);
                    if (response.status !== 401) {
                        setError("Failed to check session");
                    }
                }
            } catch (error) {
                console.error("Error checking session:", error);
                setSessionData(null);
                setUserRole(null);
                setError("Network error while checking session");
            }
            
            setLoading(false);
        };

        checkSession();
    }, []);

    const isOwner = userRole?.role === "owner";
    const isEditor = userRole?.role === "editor";
    const isMember = userRole?.role === "member";

    return {
        user: userRole, // ใช้ userRole แทน sessionData เพื่อให้มี role
        sessionData,
        userRole,
        loading,
        error,
        isOwner,
        isEditor,
        isMember,
        isAuthenticated: !!sessionData,
        role: userRole?.role,
    };
}
