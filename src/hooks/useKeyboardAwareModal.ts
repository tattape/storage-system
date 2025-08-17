"use client";

import { useEffect, useState } from 'react';

interface KeyboardAwareModalOptions {
  isOpen: boolean;
}

export function useKeyboardAwareModal({ isOpen }: KeyboardAwareModalOptions) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // ตรวจสอบว่าเป็น mobile/tablet หรือไม่
    const isMobileOrTablet = typeof window !== 'undefined' && 
      (window.innerWidth <= 1024 || 'ontouchstart' in window);
    
    if (!isMobileOrTablet) {
      return; // ถ้าไม่ใช่ mobile/tablet ไม่ต้องทำอะไร
    }

    const initialViewportHeight = window.visualViewport?.height || window.innerHeight;

    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // ถือว่าแป้นพิมพ์เปิดเมื่อ viewport สูงลดลงมากกว่า 150px
      const keyboardIsOpen = heightDifference > 150;
      
      setKeyboardHeight(keyboardIsOpen ? heightDifference : 0);
      setIsKeyboardOpen(keyboardIsOpen);
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
      
      // Clean up when component unmounts  
      // ไม่ต้องทำอะไรเพิ่มเติม เพราะไม่ได้ใช้ body class หรือ padding แล้ว
    };
  }, [isOpen]);

  // คำนวณ modal position และ styling
  const getModalStyles = () => {
    if (!isKeyboardOpen || keyboardHeight === 0) {
      // ถ้าไม่มี keyboard ให้ modal อยู่ตรงกลาง
      return {
        position: 'center' as const,
        styles: {},
        className: ''
      };
    }

    // เมื่อมี keyboard ให้ปรับ modal ให้อยู่เหนือ keyboard
    const availableHeight = window.visualViewport?.height || window.innerHeight;
    const topOffset = Math.max(20, availableHeight * 0.1); // เริ่มจากตำแหน่ง 10% จากด้านบน

    return {
      position: 'top' as const,
      styles: {
        transform: `translateY(${topOffset}px)`
      },
      className: 'keyboard-aware-modal'
    };
  };

  return {
    keyboardHeight,
    isKeyboardOpen,
    modalStyles: getModalStyles()
  };
}
