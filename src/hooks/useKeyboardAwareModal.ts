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
      
      console.log('⌨️ Keyboard state:', { keyboardIsOpen, heightDifference, currentHeight });
    };

    // Auto-scroll function เมื่อ input ได้รับ focus - ใช้ debounce
    const handleInputFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        console.log('🎯 Input focused:', target); // Debug log
        
        // Clear existing timer
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        
        // Set new timer
        const newTimer = setTimeout(() => {
          scrollInputIntoView(target);
        }, 400); // เพิ่ม delay เพื่อรอ keyboard แสดงเสร็จ
        
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
          
          // คำนวณตำแหน่งใหม่ที่ input ควรอยู่ (ประมาณ 1/4 ของหน้าจอที่เหลือ)
          const targetPositionFromTop = Math.max(100, usableHeight * 0.25);
          
          // คำนวณ scroll amount ที่ต้องการ
          const inputRelativeTop = inputRect.top - containerRect.top + modalContainer.scrollTop;
          const newScrollTop = inputRelativeTop - targetPositionFromTop;
          
          console.log('📊 Enhanced scroll calculation:', {
            availableHeight,
            keyboardOffset,
            usableHeight,
            targetPositionFromTop,
            inputRelativeTop,
            newScrollTop,
            currentScrollTop: modalContainer.scrollTop,
            containerRect,
            inputRect
          });
          
          // Scroll ใน modal container แบบแม่นยำ
          modalContainer.scrollTo({
            top: Math.max(0, newScrollTop),
            behavior: 'smooth'
          });
          
          // Double-check: scroll อีกครั้งหลังจาก animation เสร็จ
          setTimeout(() => {
            const finalInputRect = input.getBoundingClientRect();
            const finalContainerRect = modalContainer.getBoundingClientRect();
            const currentAvailableHeight = window.visualViewport?.height || window.innerHeight;
            const currentKeyboardOffset = isKeyboardOpen ? keyboardHeight : 250;
            const currentUsableHeight = currentAvailableHeight - currentKeyboardOffset;
            
            // ตรวจสอบว่า input อยู่ในตำแหน่งที่ดีหรือไม่
            const inputVisibleTop = finalInputRect.top - finalContainerRect.top;
            const inputVisibleBottom = finalInputRect.bottom - finalContainerRect.top;
            
            if (inputVisibleBottom > currentUsableHeight || inputVisibleTop < 50) {
              console.log('🔧 Fine-tuning scroll position');
              const adjustment = inputVisibleBottom - (currentUsableHeight * 0.7);
              modalContainer.scrollBy({
                top: adjustment,
                behavior: 'smooth'
              });
            }
          }, 500);
          
        }, 100);
        
      } else {
        console.log('🌍 Scrolling window (no modal container found)');
        
        // Fallback: scroll หน้าต่างหลัก
        input.focus();
        
        setTimeout(() => {
          const inputRect = input.getBoundingClientRect();
          const availableHeight = window.visualViewport?.height || window.innerHeight;
          const keyboardOffset = isKeyboardOpen ? keyboardHeight : 250;
          const usableHeight = availableHeight - keyboardOffset;
          const targetPosition = usableHeight * 0.25;
          
          const scrollAmount = inputRect.top - targetPosition;
          
          if (scrollAmount > 0) {
            window.scrollBy({
              top: scrollAmount,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    };

    // Body padding management for extra scroll space - ทำงานทุกอุปกรณ์
    const manageBodyPadding = () => {
      if (typeof window === 'undefined') return;
      
      // เพิ่ม padding แม้ไม่มี keyboard เพื่อให้มี scroll space เพียงพอ
      const baseExtraSpace = 300; // พื้นฐาน 300px สำหรับ scroll space
      const keyboardSpace = (isKeyboardOpen && keyboardHeight > 0) ? keyboardHeight : 0;
      const totalSpace = baseExtraSpace + keyboardSpace;
      
      console.log('📏 Setting body padding:', totalSpace + 'px');
      document.body.style.paddingBottom = `${totalSpace}px`;
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
