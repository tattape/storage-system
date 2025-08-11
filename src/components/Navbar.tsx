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
        <HeroNavbar className="sticky top-0 z-50 bg-white/15 shadow-md backdrop-blur-2xl">
            <NavbarBrand>
                <span className="font-bold text-secondary-200 text-xl">Storage System</span>
            </NavbarBrand>
            <NavbarContent justify="end">
                <NavbarItem>
                    <Button color="secondary" className="border border-secondary-300 text-secondary-100" variant="bordered" size="sm" onPress={handleLogout}>
                        Logout
                    </Button>
                </NavbarItem>
            </NavbarContent>
        </HeroNavbar>
    );
}
