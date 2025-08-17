"use client";
import { useState, useRef } from 'react';
import { 
    Dropdown, 
    DropdownTrigger, 
    DropdownMenu, 
    DropdownItem,
    Card,
    CardBody,
    Divider,
    Chip
} from "@heroui/react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { useIsMobileOrTablet } from "../hooks/useIsMobileOrTablet";
import NotificationButton from "./NotificationButton";
import NotificationCard from "./NotificationCard";

// Icons
const HomeIcon = ({ active }: { active: boolean }) => (
    <svg 
        className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-500'}`} 
        fill={active ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const DashboardIcon = ({ active }: { active: boolean }) => (
    <svg 
        className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-500'}`} 
        fill={active ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const MenuIcon = () => (
    <svg 
        className="w-6 h-6 text-gray-500" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const UserIcon = () => (
    <svg 
        className="w-5 h-5 text-gray-600" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const LogoutIcon = () => (
    <svg 
        className="w-5 h-5 text-red-500" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const AlertIcon = ({ active }: { active: boolean }) => (
    <svg 
        className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-500'}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const AlertIconWithBadge = ({ active }: { active: boolean }) => (
    <div className="relative w-6 h-6">
        <AlertIcon active={active} />
        <NotificationButton iconSize={0} className="absolute -top-2 -right-2 z-10" />
    </div>
);

export default function BottomNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, userRole, isOwner } = useAuth();
    const isMobileOrTablet = useIsMobileOrTablet();
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const notificationDropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        await signOut(auth);
        await fetch('/api/session', { method: 'DELETE' });
        router.replace('/login');
    };

    const navigateTo = (path: string) => {
        router.push(path);
    };

    const handleNotificationClick = () => {
        if (isMobileOrTablet) {
            // สำหรับ mobile/tablet ให้ไปหน้าใหม่
            router.push('/notifications');
        } else {
            // สำหรับ desktop ให้แสดง dropdown
            setIsNotificationOpen(!isNotificationOpen);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'owner': return 'danger';
            case 'editor': return 'warning';
            case 'member': return 'success';
            default: return 'default';
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-t border-gray-200 shadow-lg safe-area-bottom">
            <div className="flex items-center justify-around px-1 py-2 max-w-screen-xl mx-auto h-16">
                {/* Home */}
                <div
                    className="flex flex-col items-center p-1 min-w-unit-16 h-auto bottom-nav-item cursor-pointer"
                    onClick={() => navigateTo('/home')}
                >
                    <HomeIcon active={pathname === '/home'} />
                    <span className={`text-xs mt-1 ${pathname === '/home' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                        Home
                    </span>
                </div>

                {/* Dashboard */}
                <div
                    className="flex flex-col items-center p-1 min-w-unit-16 h-auto bottom-nav-item cursor-pointer"
                    onClick={() => navigateTo('/dashboard')}
                >
                    <DashboardIcon active={pathname === '/dashboard'} />
                    <span className={`text-xs mt-1 ${pathname === '/dashboard' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                        Dashboard
                    </span>
                </div>

                {/* Notifications */}
                <div
                    className="flex flex-col items-center p-1 min-w-unit-16 h-auto bottom-nav-item cursor-pointer"
                    onClick={handleNotificationClick}
                >
                    <AlertIconWithBadge active={pathname === '/notifications' || (!isMobileOrTablet && isNotificationOpen)} />
                    <span className={`text-xs mt-1 ${pathname === '/notifications' || (!isMobileOrTablet && isNotificationOpen) ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                        Alerts
                    </span>
                </div>

                {/* Menu */}
                <Dropdown placement="top-end" isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <DropdownTrigger>
                        <div className="flex flex-col items-center p-1 min-w-unit-16 h-auto bottom-nav-item cursor-pointer">
                            <MenuIcon />
                            <span className="text-xs mt-1 text-gray-500">
                                Menu
                            </span>
                        </div>
                    </DropdownTrigger>
                    <DropdownMenu 
                        aria-label="User menu"
                        className="w-64"
                        variant="flat"
                    >
                        {/* User Info Header */}
                        <DropdownItem key="user-info" isReadOnly className="h-auto p-0">
                            <Card className="shadow-none border-0">
                                <CardBody className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-full">
                                            <UserIcon />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">
                                                {user?.email?.split('@')[0] || 'Unknown User'}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {user?.email}
                                            </p>
                                            <div className="mt-1">
                                                <Chip
                                                    size="sm"
                                                    color={getRoleColor(userRole?.role || '')}
                                                    variant="flat"
                                                    className="text-xs"
                                                >
                                                    {userRole?.role?.toUpperCase() || 'UNKNOWN'}
                                                </Chip>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </DropdownItem>

                        <DropdownItem key="divider" isReadOnly className="h-auto p-0">
                            <Divider />
                        </DropdownItem>

                        {/* Cleanup (Owner only) */}
                        {isOwner ? (
                            <DropdownItem 
                                key="cleanup" 
                                onPress={() => navigateTo('/cleanup')}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="text-lg">🧹</div>
                                    <span>Cleanup</span>
                                </div>
                            </DropdownItem>
                        ) : null}

                        {isOwner ? (
                            <DropdownItem key="divider2" isReadOnly className="h-auto p-0">
                                <Divider />
                            </DropdownItem>
                        ) : null}

                        {/* Logout */}
                        <DropdownItem 
                            key="logout" 
                            onPress={handleLogout}
                            className="text-red-600"
                        >
                            <div className="flex items-center gap-2">
                                <LogoutIcon />
                                <span>Logout</span>
                            </div>
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
            
            {/* Floating Notification Card - แสดงเฉพาะบน Desktop */}
            {!isMobileOrTablet && isNotificationOpen && (
                <div 
                    ref={notificationDropdownRef}
                    className="fixed bottom-20 right-4 z-50"
                >
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-25 z-40"
                        onClick={() => setIsNotificationOpen(false)}
                    />
                    <div className="relative z-50">
                        <NotificationCard onClose={() => setIsNotificationOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
