"use client";
import { Badge } from "@heroui/react";
import { useNotifications } from "../hooks/useNotifications";
import NotificationIcon from "./icons/NotificationIcon";

interface NotificationButtonProps {
    className?: string;
    iconSize?: number;
}

export default function NotificationButton({ className = "", iconSize = 24 }: NotificationButtonProps) {
    const { unreadCount } = useNotifications();
    
    return (
        <div className={`relative inline-flex ${className}`}>
            <Badge 
                content={unreadCount > 0 ? unreadCount : ''} 
                color="danger" 
                size="sm"
                isInvisible={unreadCount === 0}
                className="z-10"
            >
                {iconSize > 0 && <NotificationIcon size={iconSize} />}
                {iconSize === 0 && <div className="w-3 h-3" />}
            </Badge>
        </div>
    );
}
