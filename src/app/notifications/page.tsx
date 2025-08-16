"use client";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { useState } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { Notification } from "../../services/notifications";
import { formatDistanceToNow } from "date-fns";

const BackIcon = () => (
    <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

export default function NotificationsPage() {
    const router = useRouter();
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
    const [displayCount, setDisplayCount] = useState(10);

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
    };

    const handleLoadMore = () => {
        setDisplayCount(prev => Math.min(prev + 10, notifications.length));
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
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="light"
                            isIconOnly
                            onPress={() => router.back()}
                            className="text-gray-600"
                        >
                            <BackIcon />
                        </Button>
                        <h1 className="text-xl font-semibold">Notifications</h1>
                        {unreadCount > 0 && (
                            <Chip
                                size="sm"
                                color="danger"
                                variant="flat"
                                className="text-xs"
                            >
                                {unreadCount} unread
                            </Chip>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            size="sm"
                            variant="light"
                            onPress={markAllAsRead}
                            className="text-blue-600"
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-4">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-2xl mb-2">⏳</div>
                        <div>Loading notifications...</div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <div className="text-4xl mb-4">🔔</div>
                        <div className="text-lg font-medium mb-2">No notifications yet</div>
                        <div className="text-sm">You&apos;ll see notifications here when you have them</div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.slice(0, displayCount).map((notification) => (
                            <Card 
                                key={notification.id}
                                className={`shadow-sm ${!notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                                isPressable
                                onPress={() => handleNotificationClick(notification)}
                            >
                                <CardBody className="p-4">
                                    <div className="flex gap-3">
                                        <div className="text-2xl flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <h3 className={`font-medium text-base ${!notification.isRead ? 'font-semibold' : ''}`}>
                                                    {notification.title}
                                                </h3>
                                                <Chip
                                                    size="sm"
                                                    color={getNotificationColor(notification.type)}
                                                    variant="flat"
                                                    className="text-xs"
                                                >
                                                    {notification.type}
                                                </Chip>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-400">
                                                    {formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
                                                </span>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                        
                        {/* Load More Button */}
                        {hasMoreNotifications && (
                            <div className="pt-4">
                                <Button
                                    variant="flat"
                                    onPress={handleLoadMore}
                                    className="w-full text-blue-600 bg-blue-50 hover:bg-blue-100"
                                >
                                    📄 Load {Math.min(10, notifications.length - displayCount)} more notifications
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
