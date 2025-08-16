// Global HTTP interceptor for handling authentication errors
"use client";

import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

// Extend Window interface to include our custom fetch property
declare global {
  interface Window {
    fetch: typeof fetch & { __intercepted?: boolean };
  }
}

// Track if we're already handling a 401 to prevent multiple redirects
let isHandling401 = false;

// List of API endpoints that should trigger logout on 401
const protectedApiEndpoints = ['/api/user', '/api/sales'];

// Global error handler for 401 responses
export function setupGlobalErrorHandler() {
  // Check if we've already setup the interceptor
  if (window.fetch.__intercepted) {
    return;
  }

  // Store original fetch function
  const originalFetch = window.fetch;
  
  // Override the global fetch function to intercept responses
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    
    // Get the URL being requested
    let url = '';
    if (typeof args[0] === 'string') {
      url = args[0];
    } else if (args[0] instanceof Request) {
      url = args[0].url;
    } else if (args[0] instanceof URL) {
      url = args[0].href;
    }
    
    // Check if this is a protected API endpoint
    const isProtectedApi = protectedApiEndpoints.some(endpoint => url.includes(endpoint));
    
    // Check if response is 401 (Unauthorized) and we're not already handling it
    // Only trigger on protected API endpoints and not on login page
    if (response.status === 401 && 
        !isHandling401 && 
        isProtectedApi &&
        window.location.pathname !== '/login') {
      
      isHandling401 = true;
      
      console.log('401 Unauthorized detected on protected API:', url, 'clearing session and redirecting to login');
      
      try {
        // Clear Firebase auth state
        await signOut(auth);
        
        // Clear session cookie by calling logout endpoint
        await originalFetch('/api/session', {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Error during logout process:', error);
      }
      
      // Reset flag after a delay to allow for cleanup
      setTimeout(() => {
        isHandling401 = false;
      }, 3000);
      
      // Redirect to login page with current path as return URL
      const currentPath = window.location.pathname;
      const returnUrl = currentPath !== '/login' && currentPath !== '/' ? `?returnUrl=${encodeURIComponent(currentPath)}` : '';
      
      // Use replace instead of href to prevent back button issues
      window.location.replace(`/login${returnUrl}`);
    }
    
    return response;
  };
  
  // Mark as intercepted
  window.fetch.__intercepted = true;
}

// Hook to setup the global error handler
export function useGlobalErrorHandler() {
  useEffect(() => {
    setupGlobalErrorHandler();
  }, []);
}
