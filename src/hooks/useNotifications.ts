import { useState, useEffect } from 'react';
import { 
    Notification, 
    subscribeToNotifications, 
    subscribeToUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead 
} from '../services/notifications';

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        
        // Subscribe to notifications (global - all users see the same)
        const unsubscribeNotifications = subscribeToNotifications(
            (newNotifications) => {
                setNotifications(newNotifications);
                setLoading(false);
            }
        );

        // Subscribe to unread count (global)
        const unsubscribeUnreadCount = subscribeToUnreadCount(
            (count) => {
                setUnreadCount(count);
            }
        );

        return () => {
            unsubscribeNotifications();
            unsubscribeUnreadCount();
        };
    }, []);

    const markAsRead = async (notificationId: string) => {
        try {
            await markNotificationAsRead(notificationId);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead
    };
}
