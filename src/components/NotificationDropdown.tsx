"use client";
import { 
    Dropdown, 
    DropdownTrigger, 
    DropdownMenu, 
    DropdownItem,
    Button,
    Badge,
    Card,
    CardBody,
    Divider,
    Chip
} from "@heroui/react";
import { useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import NotificationIcon from "./icons/NotificationIcon";
import { Notification } from "../services/notifications";
import { formatDistanceToNow } from "date-fns";

export default function NotificationDropdown() {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
    const [displayCount, setDisplayCount] = useState(5); // เริ่มต้นแสดง 5 รายการ

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
    };

    const handleLoadMore = () => {
        setDisplayCount(prev => Math.min(prev + 5, notifications.length));
    };

    const handleDropdownOpen = () => {
        // Reset display count when dropdown opens
        setDisplayCount(5);
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
        <Dropdown placement="bottom-end" onOpenChange={(isOpen) => isOpen && handleDropdownOpen()}>
            <DropdownTrigger>
                <Button
                    variant="light"
                    isIconOnly
                    className="text-secondary-500 hover:text-secondary-600"
                >
                    <Badge 
                        content={unreadCount > 0 ? unreadCount : ''} 
                        color="danger" 
                        size="sm"
                        isInvisible={unreadCount === 0}
                    >
                        <NotificationIcon size={20} />
                    </Badge>
                </Button>
            </DropdownTrigger>
            <DropdownMenu 
                aria-label="Notifications"
                className="w-80"
                variant="flat"
            >
                {/* Fixed Header */}
                <DropdownItem key="header" isReadOnly className="h-auto p-0">
                    <Card className="shadow-none border-0">
                        <CardBody className="px-4 py-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Notifications</h3>
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
                            </div>
                        </CardBody>
                    </Card>
                </DropdownItem>
                
                <DropdownItem key="divider" isReadOnly className="h-auto p-0">
                    <Divider />
                </DropdownItem>

                {/* Scrollable Content */}
                <DropdownItem key="content" isReadOnly className="h-auto p-0 hover:bg-transparent!">
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
                                        <Card 
                                            className={`shadow-none border-0 mx-2 ${!notification.isRead ? 'bg-blue-50' : 'border-gray-200 border'}`}
                                            isPressable
                                        >
                                            <CardBody className="px-4 py-3">
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
                                            </CardBody>
                                        </Card>
                                    </div>
                                ))}
                                
                                {/* Load More Button */}
                                {hasMoreNotifications && (
                                    <div className="px-2 pb-2">
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
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
}
