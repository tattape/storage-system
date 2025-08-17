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

    const initialViewportHeight = window.visualViewport?.height || window.innerHeight;

    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // ถือว่าแป้นพิมพ์เปิดเมื่อ viewport สูงลดลงมากกว่า 150px
      const keyboardIsOpen = heightDifference > 150;
      
      setKeyboardHeight(keyboardIsOpen ? heightDifference : 0);
      setIsKeyboardOpen(keyboardIsOpen);
      
      // เพิ่ม/ลบ class สำหรับ CSS styling เฉพาะเมื่อ keyboard เปิด/ปิด
      if (keyboardIsOpen) {
        document.body.classList.add('keyboard-open');
        // เพิ่ม scroll space เฉพาะเมื่อ keyboard เปิด
        const extraSpace = heightDifference + 50; // keyboard height + พื้นที่เพิ่มเติม 50px
        document.body.style.paddingBottom = `${extraSpace}px`;
      } else {
        document.body.classList.remove('keyboard-open');
        // ลบ padding เมื่อ keyboard ปิด
        document.body.style.paddingBottom = '';
      }
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
      
      // Clean up body padding when component unmounts
      if (typeof document !== 'undefined') {
        document.body.style.paddingBottom = '';
        document.body.classList.remove('keyboard-open');
      }
    };
  }, [isOpen, isKeyboardOpen, keyboardHeight]);

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
    modalStyles: getModalStyles()
  };
}
