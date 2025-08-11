"use client";
import { Button, Navbar as HeroNavbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();
    const handleLogout = async () => {
        await signOut(auth);
        await fetch('/api/session', { method: 'DELETE' });
        router.replace('/login');
    };

    return (
        <HeroNavbar className="sticky top-0 z-10 bg-white/80 shadow-md backdrop-blur-md">
            <NavbarBrand>
                <span className="font-bold text-green-700 text-xl">Storage System</span>
            </NavbarBrand>
            <NavbarContent justify="end">
                <NavbarItem>
                    <Button color="danger" size="sm" onClick={handleLogout}>
                        Logout
                    </Button>
                </NavbarItem>
            </NavbarContent>
        </HeroNavbar>
    );
}
