/**
 * Hook for preserving scroll position during page updates
 */
import { useRef, useCallback, useEffect } from 'react';

export const useScrollPreservation = () => {
  const scrollPositionRef = useRef<number>(0);
  const isRestoringRef = useRef<boolean>(false);

  const preserveScrollPosition = useCallback(() => {
    // Save current scroll position
    scrollPositionRef.current = window.scrollY || document.documentElement.scrollTop;
  }, []);

  const restoreScrollPosition = useCallback(() => {
    const scrollTop = scrollPositionRef.current;
    
    if (scrollTop === 0) return; // Don't restore if position was already at top
    
    isRestoringRef.current = true;
    
    const attemptRestore = () => {
      if (window.scrollY !== scrollTop) {
        window.scrollTo({
          top: scrollTop,
          behavior: 'instant' as ScrollBehavior
        });
      }
    };

    // Multiple attempts to ensure scroll restoration
    attemptRestore();
    
    // Use requestAnimationFrame for next frame
    requestAnimationFrame(() => {
      attemptRestore();
      
      // Additional attempts with increasing delays
      setTimeout(attemptRestore, 10);
      setTimeout(attemptRestore, 50);
      setTimeout(attemptRestore, 100);
      setTimeout(() => {
        attemptRestore();
        isRestoringRef.current = false;
      }, 200);
    });
  }, []);

  // Prevent unwanted scrolling during restoration
  useEffect(() => {
    const handleScroll = () => {
      if (isRestoringRef.current) {
        // If we're in the middle of restoring, force the correct position
        const targetPosition = scrollPositionRef.current;
        if (Math.abs(window.scrollY - targetPosition) > 10) {
          window.scrollTo({
            top: targetPosition,
            behavior: 'instant' as ScrollBehavior
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    preserveScrollPosition,
    restoreScrollPosition,
  };
};
