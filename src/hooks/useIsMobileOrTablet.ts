import { useState, useEffect } from 'react';

export function useIsMobileOrTablet() {
    const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            // Check if window is available (client-side)
            if (typeof window !== 'undefined') {
                // Check screen width (mobile: < 768px, tablet: 768px - 1024px)
                const isMobile = window.innerWidth < 768;
                const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
                const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
                
                // Also check user agent for additional mobile/tablet detection
                const userAgent = navigator.userAgent.toLowerCase();
                const isMobileUA = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(userAgent);
                const isTabletUA = /ipad|tablet|playbook|silk/.test(userAgent);
                
                setIsMobileOrTablet(
                    isMobile || 
                    isTablet || 
                    isMobileUA || 
                    isTabletUA || 
                    (isTouchDevice && window.innerWidth <= 1024)
                );
            }
        };

        // Initial check
        checkDevice();

        // Listen for resize events
        window.addEventListener('resize', checkDevice);
        
        // Listen for orientation changes (mobile/tablet)
        window.addEventListener('orientationchange', () => {
            // Small delay to ensure dimensions are updated after orientation change
            setTimeout(checkDevice, 100);
        });

        return () => {
            window.removeEventListener('resize', checkDevice);
            window.removeEventListener('orientationchange', checkDevice);
        };
    }, []);

    return isMobileOrTablet;
}
