"use client";
import { Modal, ModalContent } from "@heroui/react";
import { useEffect } from "react";

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  className?: string;
}

export default function MobileModal({ 
  isOpen, 
  onClose, 
  children, 
  size = "md",
  className = "" 
}: MobileModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.classList.add('modal-open');
      
      // Handle mobile viewport
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    } else {
      // Restore body scroll
      document.body.classList.remove('modal-open');
      
      // Restore viewport
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1');
      }
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size={size}
      className={`mobile-modal-container ${className}`}
      classNames={{
        wrapper: "mobile-modal-container",
        base: "mobile-modal-content",
        body: "modal-body-mobile",
      }}
      scrollBehavior="inside"
      placement="top"
      backdrop="blur"
    >
      <ModalContent className="mobile-modal-content">
        {children}
      </ModalContent>
    </Modal>
  );
}
