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
      if (!isKeyboardOpen) return;
      
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        setTimeout(() => {
          // Scroll with extra bottom offset to ensure input is well above keyboard
          const rect = target.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const keyboardTop = windowHeight - keyboardHeight;
          
          // If input is below keyboard, scroll it to safe position
          if (rect.bottom > keyboardTop - 100) { // 100px buffer above keyboard
            target.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
          }
        }, 300); // รอให้ keyboard animation เสร็จก่อน
      }
    };

    // Body padding management for extra scroll space
    const manageBodyPadding = () => {
      if (typeof window === 'undefined') return;
      
      if (isKeyboardOpen && keyboardHeight > 0) {
        // Add extra scroll space at bottom when keyboard is open
        document.body.style.paddingBottom = `${keyboardHeight + 50}px`;
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
    if (!isMobile || !isKeyboardOpen) {
      return {
        position: 'center' as const,
        styles: {},
        className: ''
      };
    }

    // เมื่อแป้นพิมพ์เปิด ให้ modal อยู่ตำแหน่งเดิม (center) แต่เพิ่ม scroll space
    // โดยเพิ่ม padding-bottom เท่ากับความสูง keyboard เพื่อให้ scroll ได้มากขึ้น
    return {
      position: 'center' as const,
      styles: {
        paddingBottom: `${keyboardHeight}px`, // เพิ่ม scroll space
      },
      className: 'keyboard-aware-modal-scroll'
    };
  };

  return {
    keyboardHeight,
    isKeyboardOpen,
    viewportHeight,
    modalStyles: getModalStyles()
  };
}
