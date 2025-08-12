"use client";
import { useState, useEffect } from 'react';

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  useEffect(() => {
    // Check if device is mobile or tablet (including iPad)
    const isMobileOrTablet = typeof window !== 'undefined' && 
      (window.innerWidth <= 1024 || /iPad|iPhone|iPod|Android/i.test(navigator.userAgent));
    
    if (!isMobileOrTablet) return;

    const handleViewportChange = () => {
      if (typeof window !== 'undefined') {
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const windowHeight = window.innerHeight;
        const keyboardHeight = windowHeight - viewportHeight;
        
        // Improved threshold for iPad - keyboard is usually 300-400px
        const threshold = window.innerWidth > 768 ? 100 : 50; // Higher threshold for tablets
        setKeyboardHeight(keyboardHeight > threshold ? keyboardHeight : 0);
      }
    };

    // Listen for viewport changes (keyboard show/hide)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleViewportChange);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleViewportChange);
      }
    };
  }, []);

  return keyboardHeight;
}
