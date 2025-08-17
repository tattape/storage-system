"use client";

import { useEffect, useState } from 'react';

interface KeyboardAwareModalOptions {
  isOpen: boolean;
  isMobile?: boolean;
}

export function useKeyboardAwareModal({ isOpen, isMobile = false }: KeyboardAwareModalOptions) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    setViewportHeight(initialViewportHeight);

    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // ถือว่าแป้นพิมพ์เปิดเมื่อ viewport สูงลดลงมากกว่า 150px
      const keyboardIsOpen = heightDifference > 150;
      
      setKeyboardHeight(keyboardIsOpen ? heightDifference : 0);
      setIsKeyboardOpen(keyboardIsOpen);
      setViewportHeight(currentHeight);
    };

    // Auto-scroll function เมื่อ input ได้รับ focus
    const handleInputFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        setTimeout(() => {
          // Force scroll to center the input in the available viewport
          // This ensures input is positioned above the keyboard
          target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center', // Center the input in the visible area
            inline: 'nearest'
          });
          
          // Additional scroll adjustment for keyboard space
          setTimeout(() => {
            const rect = target.getBoundingClientRect();
            const currentViewportHeight = window.visualViewport?.height || window.innerHeight;
            const targetCenter = currentViewportHeight / 2;
            
            // If input is not well centered above keyboard, adjust scroll
            if (rect.top + rect.height / 2 > targetCenter) {
              window.scrollBy({
                top: (rect.top + rect.height / 2) - targetCenter + 50, // Extra 50px above center
                behavior: 'smooth'
              });
            }
          }, 100); // Short delay for initial scroll to complete
        }, 100); // Reduced delay for faster response
      }
    };

    // Body padding management for extra scroll space
    const manageBodyPadding = () => {
      if (typeof window === 'undefined') return;
      
      if (isKeyboardOpen && keyboardHeight > 0) {
        // Add generous scroll space at bottom when keyboard is open
        // This ensures inputs can always scroll above the keyboard
        const extraSpace = keyboardHeight + 200; // Keyboard height + 200px extra space
        document.body.style.paddingBottom = `${extraSpace}px`;
      } else {
        // Remove extra padding when keyboard is closed
        document.body.style.paddingBottom = '';
      }
    };

    // Apply body padding management
    manageBodyPadding();

    // ใช้ visualViewport API สำหรับ mobile keyboard detection
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      // Fallback สำหรับ browser ที่ไม่รองรับ visualViewport
      window.addEventListener('resize', handleViewportChange);
    }

    // เพิ่ม event listener สำหรับ input focus
    document.addEventListener('focusin', handleInputFocus);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleViewportChange);
      }
      document.removeEventListener('focusin', handleInputFocus);
      
      // Clean up body padding when component unmounts
      if (typeof document !== 'undefined') {
        document.body.style.paddingBottom = '';
      }
    };
  }, [isOpen, isMobile, isKeyboardOpen, keyboardHeight]);

  // คำนวณ modal position และ styling
  const getModalStyles = () => {
    // ไม่ส่ง styles ใดๆ กลับไป ให้ modal ใช้ขนาดปกติ 90vh
    // แค่ใช้ body padding เพื่อเพิ่ม scroll space เมื่อ keyboard เปิด
    return {
      position: 'center' as const,
      styles: {}, // ไม่มี style เพิ่มเติม
      className: '' // ไม่มี class เพิ่มเติม
    };
  };

  return {
    keyboardHeight,
    isKeyboardOpen,
    viewportHeight,
    modalStyles: getModalStyles()
  };
}
