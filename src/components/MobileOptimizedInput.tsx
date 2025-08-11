import { Input, InputProps } from "@heroui/react";
import { useEffect, useRef } from "react";

interface MobileOptimizedInputProps extends InputProps {
  preventZoom?: boolean;
  adjustForKeyboard?: boolean;
}

export default function MobileOptimizedInput({ 
  preventZoom = true, 
  adjustForKeyboard = true,
  ...props 
}: MobileOptimizedInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleFocus = () => {
      if (adjustForKeyboard && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        // Scroll element into view when keyboard appears
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }, 300); // Delay to let keyboard animation finish
      }
    };

    const handleBlur = () => {
      if (adjustForKeyboard && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        // Reset scroll position when keyboard disappears
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      }
    };

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('focus', handleFocus);
      inputElement.addEventListener('blur', handleBlur);

      // Prevent zoom on focus for mobile
      if (preventZoom && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        inputElement.style.fontSize = '16px'; // Prevents zoom on iOS
      }

      return () => {
        inputElement.removeEventListener('focus', handleFocus);
        inputElement.removeEventListener('blur', handleBlur);
      };
    }
  }, [preventZoom, adjustForKeyboard]);

  return (
    <Input
      ref={inputRef}
      {...props}
      classNames={{
        input: `${props.classNames?.input || ''} ${preventZoom ? 'text-base' : ''}`,
        ...props.classNames
      }}
    />
  );
}
