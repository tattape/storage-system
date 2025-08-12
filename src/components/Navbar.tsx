"use client";
import { Button, Navbar as HeroNavbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from "@heroui/react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const handleLogout = async () => {
        await signOut(auth);
        await fetch('/api/session', { method: 'DELETE' });
        router.replace('/login');
    };

    const menuItems = [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Summary", href: "/summary" },
    ];

    const handleMenuItemClick = (href: string) => {
        setIsMenuOpen(false);
        router.push(href);
    };

    return (
        <HeroNavbar 
            className="sticky top-0 z-50 bg-white/15 shadow-md backdrop-blur-2xl"
            onMenuOpenChange={setIsMenuOpen}
        >
            <NavbarContent>
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="sm:hidden text-secondary-200 dark:text-white"
                />
                <NavbarBrand>
                    <span className="font-bold text-secondary-200 text-xl">Storage System</span>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarItem>
                    <Link 
                        href="/dashboard" 
                        className={`px-4 py-2 rounded-lg transition-all ${
                            pathname === '/dashboard' 
                                ? 'bg-white/20 text-white font-semibold' 
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        Dashboard
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link 
                        href="/summary" 
                        className={`px-4 py-2 rounded-lg transition-all ${
                            pathname === '/summary' 
                                ? 'bg-white/20 text-white font-semibold' 
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        Summary
                    </Link>
                </NavbarItem>
            </NavbarContent>

            <NavbarContent justify="end">
                <NavbarItem>
                    <Button color="secondary" className="border border-secondary-300 text-secondary-100" variant="bordered" size="sm" onPress={handleLogout}>
                        Logout
                    </Button>
                </NavbarItem>
            </NavbarContent>

            <NavbarMenu className="bg-white/20 backdrop-blur-lg border-t border-gray-200 shadow-lg">
                {menuItems.map((item, index) => (
                    <NavbarMenuItem key={`${item.name}-${index}`} className="">
                        <button
                            className={`w-full text-lg py-3 px-2 block rounded-lg transition-all text-left ${
                                pathname === item.href 
                                    ? 'text-secondary-200 font-semibold text-2xl!' 
                                    : 'text-secondary-100 hover:text-secondary-600 hover:bg-secondary-50'
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
