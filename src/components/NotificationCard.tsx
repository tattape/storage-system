"use client";
import { 
    Card,
    CardBody,
    Button,
    Chip
} from "@heroui/react";
import { useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { Notification } from "../services/notifications";
import { formatDistanceToNow } from "date-fns";

interface NotificationCardProps {
    onClose?: () => void;
}

export default function NotificationCard({ onClose }: NotificationCardProps) {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
    const [displayCount, setDisplayCount] = useState(5);

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
    };

    const handleLoadMore = () => {
        setDisplayCount(prev => Math.min(prev + 5, notifications.length));
    };

    const hasMoreNotifications = displayCount < notifications.length;

    const getNotificationColor = (type: Notification['type']) => {
        switch (type) {
            case 'error': return 'danger';
            case 'warning': return 'warning';
            case 'success': return 'success';
            case 'info': return 'primary';
            default: return 'default';
        }
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'error': return '🚨';
            case 'warning': return '⚠️';
            case 'success': return '✅';
            case 'info': return 'ℹ️';
            default: return '📢';
        }
    };

    return (
        <Card className="w-80 max-h-96 shadow-lg">
            <CardBody className="p-0">
                {/* Header */}
                <div className="px-4 py-3 border-b">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <Button
                                    size="sm"
                                    variant="light"
                                    onPress={markAllAsRead}
                                    className="text-xs"
                                >
                                    Mark all as read
                                </Button>
                            )}
                            {onClose && (
                                <Button
                                    size="sm"
                                    variant="light"
                                    isIconOnly
                                    onPress={onClose}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-h-80 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-4 text-gray-500">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <div className="text-2xl mb-2">🔔</div>
                            <div>No notifications yet</div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {notifications.slice(0, displayCount).map((notification) => (
                                <div 
                                    key={notification.id} 
                                    onClick={() => handleNotificationClick(notification)}
                                    className="cursor-pointer"
                                >
                                    <div 
                                        className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${
                                            !notification.isRead ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="text-lg flex-shrink-0">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className={`font-medium text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <Chip
                                                        size="sm"
                                                        color={getNotificationColor(notification.type)}
                                                        variant="flat"
                                                        className="text-xs"
                                                    >
                                                        {notification.type}
                                                    </Chip>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-xs text-gray-400">
                                                        {formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
                                                    </span>
                                                    {!notification.isRead && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Load More Button */}
                            {hasMoreNotifications && (
                                <div className="px-4 py-2">
                                    <Button
                                        size="sm"
                                        variant="light"
                                        onPress={handleLoadMore}
                                        className="w-full text-blue-600 hover:bg-blue-50"
                                    >
                                        📄 Load {Math.min(5, notifications.length - displayCount)} more notifications...
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
