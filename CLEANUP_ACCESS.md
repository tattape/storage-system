# Cleanup Page Access Control

## Overview
The cleanup page (`/cleanup`) is now protected with role-based access control, only allowing users with "owner" role to access it.

## Implementation Details

### 1. Navbar Integration
- Added "🧹 Cleanup" menu item to both desktop and mobile navigation
- Menu item is only visible to users with "owner" role
- Uses conditional rendering with `isOwner` from `useAuth` hook

### 2. Page Protection
- Added multi-level access control in `/app/cleanup/page.tsx`:
  - Loading state while checking authentication
  - Login requirement check
  - Owner role requirement check
- Clear error messages for unauthorized access

### 3. User Experience
- Loading state shows while checking user permissions
- Access denied message for non-owner users
- Visual indicator "Owner Access Only" in page header
- Seamless integration with existing authentication system

## Access Levels
- **Owner**: Full access to cleanup page and all functions
- **Editor/Member**: No access - redirected with clear error message
- **Unauthenticated**: Redirected to login page

## Security Features
- Client-side role checking with real-time updates
- Firebase Firestore-based role management
- No sensitive operations exposed to unauthorized users
- Graceful error handling and user feedback

## Usage
1. Only owners will see the cleanup menu in the navbar
2. Direct URL access to `/cleanup` is blocked for non-owners
3. All cleanup functions (delete old/read notifications) require owner role
4. Stats and recommendations are only visible to owners

## Files Modified
- `/src/components/Navbar.tsx` - Added conditional menu item
- `/src/app/cleanup/page.tsx` - Added role-based access control
