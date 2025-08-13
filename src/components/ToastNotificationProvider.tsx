"use client";
import { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { subscribeToNotifications, Notification } from '../services/notifications';
import { useAuth } from '../hooks/useAuth';
import 'react-toastify/dist/ReactToastify.css';

let lastNotificationId: string | null = null;

export default function ToastNotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToNotifications((notifications) => {
            // Only show toast for new notifications (first one in the list)
            if (notifications.length > 0) {
                const latestNotification = notifications[0];
                
                // Check if this is a new notification
                if (lastNotificationId !== latestNotification.id) {
                    lastNotificationId = latestNotification.id;
                    
                    // Only show toast if this notification was created recently (within last 10 seconds)
                    const notificationAge = Date.now() - latestNotification.createdAt.toDate().getTime();
                    if (notificationAge < 10000) { // 10 seconds
                        showToast(latestNotification);
                    }
                }
            }
        });

        return () => unsubscribe();
    }, [user]);

    const showToast = (notification: Notification) => {
        const message = (
            <div>
                <strong>{notification.title}</strong>
                <br />
                <span className="text-sm">{notification.message}</span>
            </div>
        );

        switch (notification.type) {
            case 'error':
                toast.error(message, {
                    autoClose: 8000,
                });
                break;
            case 'warning':
                toast.warning(message, {
                    autoClose: 6000,
                });
                break;
            case 'success':
                toast.success(message, {
                    autoClose: 4000,
                });
                break;
            case 'info':
                toast.info(message, {
                    autoClose: 4000,
                });
                break;
            default:
                toast(message, {
                    autoClose: 4000,
                });
        }
    };

    return (
        <>
            {children}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                style={{ marginTop: '70px' }} // Account for navbar
            />
        </>
    );
}
