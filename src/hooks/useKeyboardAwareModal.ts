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

    // ใช้ visualViewport API สำหรับ mobile keyboard detection
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      // Fallback สำหรับ browser ที่ไม่รองรับ visualViewport
      window.addEventListener('resize', handleViewportChange);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleViewportChange);
      }
    };
  }, [isOpen, isMobile]);

  // คำนวณ modal position และ styling
  const getModalStyles = () => {
    if (!isMobile || !isKeyboardOpen) {
      return {
        position: 'center' as const,
        styles: {},
        className: ''
      };
    }

    // เมื่อแป้นพิมพ์เปิด ขยับ modal ขึ้นมา
    const modalOffset = Math.max(20, keyboardHeight * 0.3); // ขยับขึ้น 30% ของความสูงแป้นพิมพ์
    
    return {
      position: 'top' as const,
      styles: {
        marginTop: `${modalOffset}px`,
        maxHeight: `${viewportHeight - modalOffset - 20}px`,
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
