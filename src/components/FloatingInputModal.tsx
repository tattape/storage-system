"use client";
import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from '@heroui/react';

interface FloatingInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  label: string;
  initialValue: string;
  type?: 'text' | 'number' | 'email';
  placeholder?: string;
}

export default function FloatingInputModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  label,
  initialValue,
  type = 'text',
  placeholder
}: FloatingInputModalProps) {
  const [value, setValue] = useState(initialValue);

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, isOpen]);

  const handleConfirm = () => {
    onConfirm(value);
    onClose();
  };

  const handleCancel = () => {
    setValue(initialValue); // Reset to initial value
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      placement="center"
      backdrop="blur"
      size="sm"
      isDismissable={!isMobile}
      hideCloseButton={isMobile}
      className={isMobile ? "floating-input-modal" : ""}
      classNames={{
        base: "bg-white/90 backdrop-blur-md border border-white/20",
        header: "border-b border-white/20",
        body: "py-6",
        footer: "border-t border-white/20"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-purple-800">
          {title}
        </ModalHeader>
        <ModalBody>
          <Input
            autoFocus
            label={label}
            placeholder={placeholder}
            type={type}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              } else if (e.key === 'Escape') {
                handleCancel();
              }
            }}
            classNames={{
              input: "text-lg bg-transparent",
              inputWrapper: "bg-white/50 border border-purple-200 hover:border-purple-400"
            }}
          />
        </ModalBody>
        <ModalFooter className="gap-2">
          <Button
            color="danger"
            variant="light"
            onPress={handleCancel}
          >
            ยกเลิก
          </Button>
          <Button
            color="primary"
            onPress={handleConfirm}
            className="bg-purple-600 hover:bg-purple-700"
          >
            ยืนยัน
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
