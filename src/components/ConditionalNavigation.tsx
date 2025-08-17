"use client";
import { useIsMobileOrTablet } from "../hooks/useIsMobileOrTablet";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import BottomNavigation from "./BottomNavigation";

export default function ConditionalNavigation() {
    const isMobileOrTablet = useIsMobileOrTablet();
    const pathname = usePathname();

    // Don't show navigation on login page or root page
    const hideNavigation = pathname === '/login' || pathname === '/';

    // Manage body padding for navigation
    useEffect(() => {
        if (isMobileOrTablet && !hideNavigation) {
            document.body.classList.add('bottom-nav-padding');
            document.body.classList.remove('top-navbar-padding');
        } else if (!isMobileOrTablet && !hideNavigation) {
            document.body.classList.add('top-navbar-padding');
            document.body.classList.remove('bottom-nav-padding');
        } else {
            document.body.classList.remove('bottom-nav-padding');
            document.body.classList.remove('top-navbar-padding');
        }

        return () => {
            document.body.classList.remove('bottom-nav-padding');
            document.body.classList.remove('top-navbar-padding');
        };
    }, [isMobileOrTablet, hideNavigation]);

    // Don't render navigation if on login or root page
    if (hideNavigation) {
        return null;
    }

    return (
        <>
            {/* Top Navbar - Show on desktop only */}
            <div className={`top-navbar ${isMobileOrTablet ? 'hidden' : 'block'}`}>
                <Navbar />
            </div>
            
            {/* Bottom Navigation - Show on mobile/tablet only */}
            <div className={`bottom-navigation ${isMobileOrTablet ? 'block' : 'hidden'}`}>
                <BottomNavigation />
            </div>
        </>
    );
}
