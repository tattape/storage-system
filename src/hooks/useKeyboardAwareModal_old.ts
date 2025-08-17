"use client";

import { useEffect, useState } from 'react';

interface KeyboardAwareModalOptions {
  isOpen: boolean;
}

export function useKeyboardAwareModal({ isOpen }: KeyboardAwareModalOptions) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) return; // ทำงานทุกอุปกรณ์

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
      
      // เพิ่ม/ลบ class สำหรับ CSS styling
      if (keyboardIsOpen) {
        document.body.classList.add('keyboard-open');
      } else {
        document.body.classList.remove('keyboard-open');
      }
      
      console.log('⌨️ Keyboard state changed:', { keyboardIsOpen, heightDifference });
    };

    // Auto-scroll function เมื่อ input ได้รับ focus - ใช้ debounce
    const handleInputFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        console.log('🎯 Input needs scroll adjustment:', target); // Debug log
        
        // Clear existing timer
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        
        // Set new timer - เฉพาะเมื่อต้องการ scroll
        const newTimer = setTimeout(() => {
          // ตรวจสอบว่า input อยู่ในตำแหน่งที่ดีหรือไม่ก่อน scroll
          const inputRect = target.getBoundingClientRect();
          const availableHeight = window.visualViewport?.height || window.innerHeight;
          const keyboardOffset = isKeyboardOpen ? keyboardHeight : 0;
          const usableHeight = availableHeight - keyboardOffset;
          
          // ถ้า input อยู่ในตำแหน่งที่เห็นได้แล้ว ไม่ต้อง scroll
          if (inputRect.top > 50 && inputRect.bottom < usableHeight - 50) {
            console.log('🎯 Input already visible, no scroll needed');
            return;
          }
          
          scrollInputIntoView(target);
        }, 300); // ลด delay
        
        setDebounceTimer(newTimer);
      }
    };

    // Function สำหรับ scroll input ให้อยู่เหนือ keyboard
    const scrollInputIntoView = (input: HTMLElement) => {
      // หา modal container ที่ใกล้ที่สุด
      const modalContainer = input.closest('.modal-body-scrollable, [data-slot="body"]') as HTMLElement;
      
      if (modalContainer) {
        console.log('📱 Scrolling within modal container');
        
        // Force focus และทำให้ input พร้อมใช้งาน
        input.focus();
        
        // รอให้ keyboard แสดงเสร็จก่อน scroll
        setTimeout(() => {
          // คำนวณตำแหน่งที่ต้องการ scroll ใน modal
          const containerRect = modalContainer.getBoundingClientRect();
          const inputRect = input.getBoundingClientRect();
          
          // คำนวณความสูงของ viewport ที่เหลือหลังจาก keyboard
          const availableHeight = window.visualViewport?.height || window.innerHeight;
          const keyboardOffset = isKeyboardOpen ? keyboardHeight : 250; // สมมติ keyboard 250px ถ้ายังไม่ detect
          const usableHeight = availableHeight - keyboardOffset;
          
          // คำนวณตำแหน่งใหม่ที่ input ควรอยู่ (ประมาณ 1/3 ของหน้าจอที่เหลือ)
          const targetPositionFromTop = Math.max(80, usableHeight * 0.3);
          
          // คำนวณ scroll amount ที่ต้องการ
          const inputRelativeTop = inputRect.top - containerRect.top + modalContainer.scrollTop;
          const newScrollTop = inputRelativeTop - targetPositionFromTop;
          
          // Scroll ใน modal container
          modalContainer.scrollTo({
            top: Math.max(0, newScrollTop),
            behavior: 'smooth'
          });
          
        }, 100);
        
      } else {
        console.log('🌍 Scrolling window (no modal container found)');
        
        // Fallback: scroll หน้าต่างหลัก (simplified)
        input.focus();
        
        setTimeout(() => {
          input.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
          });
        }, 100);
      }
    };

    // Body padding management - เฉพาะเมื่อ keyboard เปิดเท่านั้น
    const manageBodyPadding = () => {
      if (typeof window === 'undefined') return;
      
      if (isKeyboardOpen && keyboardHeight > 0) {
        // เพิ่ม scroll space เฉพาะเมื่อ keyboard เปิด
        const extraSpace = keyboardHeight + 100; // Keyboard height + 100px extra space
        console.log('📏 Adding body padding for keyboard:', extraSpace + 'px');
        document.body.style.paddingBottom = `${extraSpace}px`;
      } else {
        // ลบ padding เมื่อ keyboard ปิด
        console.log('📏 Removing body padding - keyboard closed');
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
      
      // Clear debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Clean up body padding when component unmounts
      if (typeof document !== 'undefined') {
        document.body.style.paddingBottom = '';
        document.body.classList.remove('keyboard-open');
      }
    };
  }, [isOpen, isKeyboardOpen, keyboardHeight, debounceTimer]); // เพิ่ม debounceTimer

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
