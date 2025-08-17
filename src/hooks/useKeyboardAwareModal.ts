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
          target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 300); // รอให้ keyboard animation เสร็จก่อน
      }
    };

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
    };
  }, [isOpen, isMobile, isKeyboardOpen]);

  // คำนวณ modal position และ styling
  const getModalStyles = () => {
    if (!isMobile || !isKeyboardOpen) {
      return {
        position: 'center' as const,
        styles: {},
        className: ''
      };
    }

    // เมื่อแป้นพิมพ์เปิด ให้ modal อยู่ด้านบนและมี scroll space เพียงพอ
    const safeAreaTop = 20; // พื้นที่ปลอดภัยด้านบน
    const availableHeight = viewportHeight - safeAreaTop * 2; // ความสูงที่ใช้ได้
    
    return {
      position: 'top' as const,
      styles: {
        marginTop: `${safeAreaTop}px`,
        maxHeight: `${availableHeight}px`,
        minHeight: `${Math.min(availableHeight, 300)}px`, // ความสูงขั้นต่ำ
      },
      className: 'keyboard-aware-modal'
    };
  };

  return {
    keyboardHeight,
    isKeyboardOpen,
    viewportHeight,
    modalStyles: getModalStyles()
  };
}
