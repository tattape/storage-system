/**
 * Global HTTP interceptor for handling authentication errors
 * Automatically redirects to login when 401 responses are detected from protected APIs
 */
"use client";

import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

declare global {
  interface Window {
    fetch: typeof fetch & { __intercepted?: boolean };
  }
}

// Prevent multiple simultaneous 401 handling
let isHandling401 = false;

/**
 * Setup global fetch interceptor to handle 401 responses
 */
export function setupGlobalErrorHandler(): void {
  if (window.fetch.__intercepted) {
    return;
  }

  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    
    // Extract URL from request
    let url = '';
    if (typeof args[0] === 'string') {
      url = args[0];
    } else if (args[0] instanceof Request) {
      url = args[0].url;
    } else if (args[0] instanceof URL) {
      url = args[0].href;
    }
    
    // Check if this is a protected API (any /api/ endpoint except public ones)
    const isApiCall = url.includes('/api/');
    const isPublicApi = url.includes('/api/health'); // Add other public APIs here if needed
    const isProtectedApi = isApiCall && !isPublicApi;
    
    // Handle 401 responses from protected APIs
    if (response.status === 401 && 
        !isHandling401 && 
        isProtectedApi &&
        window.location.pathname !== '/login') {
      
      console.log('🔒 401 detected, handling unauthorized access for:', url);
      await handleUnauthorized(originalFetch);
    } else if (response.status === 401) {
      // 401 detected but not handling due to conditions
    }
    
    return response;
  };
  
  window.fetch.__intercepted = true;
}

/**
 * Handle unauthorized responses by clearing auth and redirecting to login
 */
async function handleUnauthorized(originalFetch: typeof fetch): Promise<void> {
  isHandling401 = true;
  
  console.log('🚪 Handling unauthorized access - clearing auth and redirecting to login');
  
  try {
    // Clear Firebase authentication
    await signOut(auth);
    
    // Clear server session
    await originalFetch('/api/session', {
      method: 'DELETE',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Error during logout process:', error);
  }
  
  // Reset flag after delay
  setTimeout(() => {
    isHandling401 = false;
  }, 3000);
  
  // Redirect to login with return URL
  const currentPath = window.location.pathname;
  const returnUrl = currentPath !== '/login' && currentPath !== '/' 
    ? `?returnUrl=${encodeURIComponent(currentPath)}` 
    : '';
  
  console.log('🔄 Redirecting to login:', `/login${returnUrl}`);
  window.location.replace(`/login${returnUrl}`);
}

/**
 * React hook to setup global error handler
 */
export function useGlobalErrorHandler(): void {
  useEffect(() => {
    setupGlobalErrorHandler();
  }, []);
}
