"use client";
import React, { useState } from "react";
import { Input } from "@heroui/react";
import FloatingInputModal from "./FloatingInputModal";

interface MobileOptimizedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "email";
  placeholder?: string;
  isRequired?: boolean;
  description?: string;
  errorMessage?: string;
  isInvalid?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function MobileOptimizedInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  isRequired = false,
  description,
  errorMessage,
  isInvalid = false,
  className = "",
  size = "md"
}: MobileOptimizedInputProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if device is mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  const handleInputClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isMobile) {
      setIsModalOpen(true);
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isMobile) {
      e.target.blur(); // ทำให้ input ไม่ focus
      setIsModalOpen(true);
    }
  };

  const handleModalConfirm = (newValue: string) => {
    onChange(newValue);
  };

  if (isMobile) {
    return (
      <>
        <Input
          label={label}
          value={value}
          placeholder={placeholder}
          type={type}
          isRequired={isRequired}
          description={description}
          errorMessage={errorMessage}
          isInvalid={isInvalid}
          size={size}
          className={className}
          onClick={handleInputClick}
          onFocus={handleInputFocus}
          readOnly
          tabIndex={-1}
          inputMode="none"
          style={{ caretColor: 'transparent' }}
          classNames={{
            input: "cursor-pointer select-none",
            inputWrapper: "cursor-pointer bg-white/50 border border-purple-200 hover:border-purple-400"
          }}
        />
        
        <FloatingInputModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleModalConfirm}
          title={`แก้ไข${label}`}
          label={label}
          initialValue={value}
          type={type}
          placeholder={placeholder}
        />
      </>
    );
  }

  // Desktop version - normal input
  return (
    <Input
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      isRequired={isRequired}
      description={description}
      errorMessage={errorMessage}
      isInvalid={isInvalid}
      size={size}
      className={className}
      classNames={{
        inputWrapper: "bg-white/50 border border-purple-200 hover:border-purple-400"
      }}
    />
  );
}
