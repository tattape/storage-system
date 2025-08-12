"use client";
import { useState, useEffect } from 'react';

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  
  useEffect(() => {
    // Check if device is mobile or tablet (including iPad)
    const checkDevice = () => {
      if (typeof window !== 'undefined') {
        const userAgent = navigator.userAgent;
        const isTouch = 'ontouchstart' in window;
        const isIpad = /iPad|iPadOS/i.test(userAgent) || (navigator.maxTouchPoints > 1 && /MacIntel/.test(navigator.platform));
        const isMobile = /iPhone|iPod|Android/i.test(userAgent);
        const isTablet = window.innerWidth <= 1024 && isTouch;
        
        setIsMobileOrTablet(isIpad || isMobile || isTablet);
        return isIpad || isMobile || isTablet;
      }
      return false;
    };
    
    const deviceIsMobileOrTablet = checkDevice();
    
    if (!deviceIsMobileOrTablet) return;

    const handleViewportChange = () => {
      if (typeof window !== 'undefined') {
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const windowHeight = window.innerHeight;
        const keyboardHeight = windowHeight - viewportHeight;
        
        // Different thresholds for different devices
        let threshold = 50;
        if (window.innerWidth > 768) { // iPad/tablet
          threshold = 200; // iPad keyboard is typically 300-400px, so 200px is a good threshold
        }
        
        setKeyboardHeight(keyboardHeight > threshold ? keyboardHeight : 0);
      }
    };

    // Initial check
    handleViewportChange();

    // Listen for viewport changes (keyboard show/hide)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleViewportChange);
    }

    // Also listen for orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(handleViewportChange, 500); // Delay to let orientation change complete
    });

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleViewportChange);
      }
      window.removeEventListener('orientationchange', handleViewportChange);
    };
  }, []);

  return { keyboardHeight, isMobileOrTablet };
}
