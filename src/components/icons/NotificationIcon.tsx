import React from 'react';

interface NotificationIconProps {
    className?: string;
    size?: number;
}

export default function NotificationIcon({ className = "", size = 24 }: NotificationIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 19V20H3V19L5 17V11C5 7.9 7.03 5.17 10 4.29C10 4.19 10 4.1 10 4C10 2.34 11.34 1 13 1C14.66 1 16 2.34 16 4C16 4.1 16 4.19 16 4.29C18.97 5.17 21 7.9 21 11V17L23 19ZM19 11C19 8.24 16.76 6 14 6H10C7.24 6 5 8.24 5 11V18H19V11ZM7 19H17V20C17 21.1 16.1 22 15 22H9C7.9 22 7 21.1 7 20V19Z"
                fill="currentColor"
            />
        </svg>
    );
}
