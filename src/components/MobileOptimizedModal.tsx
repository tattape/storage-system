import { Modal, ModalProps } from "@heroui/react";
import { useEffect, useState } from "react";

interface MobileOptimizedModalProps extends ModalProps {
  children: React.ReactNode;
}

export default function MobileOptimizedModal({ children, ...props }: MobileOptimizedModalProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    if (!isMobile) return;

    const handleResize = () => {
      // Calculate keyboard height based on viewport change
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const screenHeight = window.screen.height;
      const keyboardHeight = Math.max(0, screenHeight - viewportHeight - 150); // 150px buffer
      
      setKeyboardHeight(keyboardHeight);
    };

    const handleFocusIn = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Input focused, adjust modal position
        setTimeout(() => {
          handleResize();
        }, 300);
      }
    };

    const handleFocusOut = () => {
      // Input blurred, reset position
      setTimeout(() => {
        setKeyboardHeight(0);
      }, 300);
    };

    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [isMobile]);

  return (
    <Modal
      {...props}
      classNames={{
        wrapper: `${props.classNames?.wrapper || ''} ${isMobile && keyboardHeight > 0 ? 'items-start pt-4' : ''}`,
        base: `${props.classNames?.base || ''} ${isMobile ? 'mx-2 max-h-[90vh] overflow-y-auto' : ''}`,
        ...props.classNames
      }}
      style={{
        ...(props.style || {}),
        ...(isMobile && keyboardHeight > 0 && {
          transform: `translateY(-${Math.min(keyboardHeight / 2, 100)}px)`,
          transition: 'transform 0.3s ease-in-out'
        })
      }}
    >
      {children}
    </Modal>
  );
}
