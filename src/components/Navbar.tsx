"use client";
import { Button, Navbar as HeroNavbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from "@heroui/react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.replace("/login");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        await signOut(auth);
        await fetch('/api/session', { method: 'DELETE' });
        router.replace('/login');
    };

    const menuItems = [
        { name: "Home", href: "/home" },
        { name: "Dashboard", href: "/dashboard" },
    ];

    const handleMenuItemClick = (href: string) => {
        // ปิด menu ผ่าน HeroUI's onMenuOpenChange
        setIsMenuOpen(false);
        // Navigate หลังจาก menu ปิด
        setTimeout(() => {
            router.push(href);
        }, 200);
    };

    return (
        <HeroNavbar
            className="sticky top-0 z-50 bg-white/15 shadow-md backdrop-blur-2xl"
            onMenuOpenChange={setIsMenuOpen}
            isMenuOpen={isMenuOpen}
        >
            <NavbarContent>
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="sm:hidden text-secondary-500 dark:text-white"
                />
                <NavbarBrand>
                    <span className="font-bold text-secondary-500/60 text-xl">Storage System</span>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarItem>
                    <Link 
                        href="/home" 
                        className={`px-4 py-2 rounded-lg transition-all ${
                            pathname === '/home' 
                                ? 'bg-secondary-500/30 text-white font-semibold' 
                                : 'text-secondary-500 hover:text-secondary-400 hover:bg-secondary-500/10'
                        }`}
                    >
                        Home
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link 
                        href="/dashboard" 
                        className={`px-4 py-2 rounded-lg transition-all ${
                            pathname === '/dashboard' 
                               ? 'bg-secondary-500/30 text-white font-semibold' 
                                : 'text-secondary-500 hover:text-secondary-400 hover:bg-secondary-500/10'
                        }`}
                    >
                        Dashboard
                    </Link>
                </NavbarItem>
            </NavbarContent>

            <NavbarContent justify="end">
                <NavbarItem>
                    <Button color="secondary" className="border border-secondary-300 text-secondary-600 font-bold" variant="bordered" size="sm" onPress={handleLogout}>
                        Logout
                    </Button>
                </NavbarItem>
            </NavbarContent>

            <NavbarMenu className="bg-black/20 backdrop-blur-lg border-t border-gray-200 shadow-lg">
                {menuItems.map((item, index) => (
                    <NavbarMenuItem key={`${item.name}-${index}`} className="">
                        <button
                            className={`w-full text-lg py-3 px-2 block rounded-lg transition-all text-left ${pathname === item.href
                                ? 'text-secondary-700 font-semibold text-2xl!'
                                : 'text-secondary-50 hover:text-secondary-600 hover:bg-secondary-50'
                                }`}
                            onClick={() => handleMenuItemClick(item.href)}
                        >
                            {item.name}
                        </button>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
        </HeroNavbar>
    );
}
