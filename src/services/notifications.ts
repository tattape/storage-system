import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    isRead: boolean;
    createdAt: Timestamp;
    userId?: string; // ถ้าต้องการส่งให้ user เฉพาะ
    metadata?: {
        productId?: string;
        basketId?: string;
        stockLevel?: number;
        action?: string;
        source?: 'stock_modal' | 'sales';
    };
}

// CREATE notification
export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
    const docRef = await addDoc(collection(db, "notifications"), {
        ...notification,
        createdAt: Timestamp.now()
    });
    return docRef.id;
}

// READ all notifications (for admin/all users)
export async function getAllNotifications() {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
    })) as Notification[];
}

// READ unread notifications count
export async function getUnreadNotificationsCount() {
    const q = query(
        collection(db, "notifications"), 
        where("isRead", "==", false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
}

// LISTEN to notifications in real-time
export function subscribeToNotifications(
    callback: (notifications: Notification[]) => void
) {
    const q = query(
        collection(db, "notifications"),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (querySnapshot) => {
        const notifications = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Notification[];
        callback(notifications);
    });
}

// LISTEN to unread count in real-time
export function subscribeToUnreadCount(
    callback: (count: number) => void
) {
    const q = query(
        collection(db, "notifications"),
        where("isRead", "==", false)
    );

    return onSnapshot(q, (querySnapshot) => {
        callback(querySnapshot.size);
    });
}

// UPDATE notification as read
export async function markNotificationAsRead(id: string) {
    const docRef = doc(db, "notifications", id);
    await updateDoc(docRef, { isRead: true });
}

// UPDATE all notifications as read
export async function markAllNotificationsAsRead() {
    const q = query(
        collection(db, "notifications"),
        where("isRead", "==", false)
    );

    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { isRead: true })
    );
    
    await Promise.all(updatePromises);
}

// DELETE notification
export async function deleteNotification(id: string) {
    const docRef = doc(db, "notifications", id);
    await deleteDoc(docRef);
}

// CLEANUP old notifications (older than X days)
export async function cleanupOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const q = query(
        collection(db, "notifications"),
        where("createdAt", "<", Timestamp.fromDate(cutoffDate))
    );
    
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    
    return {
        deletedCount: querySnapshot.size,
        cutoffDate: cutoffDate.toISOString()
    };
}

// CLEANUP read notifications (older than X days)
export async function cleanupReadNotifications(daysOld: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const q = query(
        collection(db, "notifications"),
        where("createdAt", "<", Timestamp.fromDate(cutoffDate)),
        where("isRead", "==", true)
    );
    
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    
    return {
        deletedCount: querySnapshot.size,
        cutoffDate: cutoffDate.toISOString()
    };
}

// GET notifications count by age
export async function getNotificationsStats() {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    // Count all notifications
    const allQuery = query(collection(db, "notifications"));
    const allSnapshot = await getDocs(allQuery);
    
    // Count old notifications (>30 days)
    const oldQuery = query(
        collection(db, "notifications"),
        where("createdAt", "<", Timestamp.fromDate(thirtyDaysAgo))
    );
    const oldSnapshot = await getDocs(oldQuery);
    
    // Count read notifications (>7 days)
    const readOldQuery = query(
        collection(db, "notifications"),
        where("createdAt", "<", Timestamp.fromDate(sevenDaysAgo)),
        where("isRead", "==", true)
    );
    const readOldSnapshot = await getDocs(readOldQuery);
    
    return {
        total: allSnapshot.size,
        oldNotifications: oldSnapshot.size,
        oldReadNotifications: readOldSnapshot.size,
        estimatedSizeKB: Math.round((allSnapshot.size * 400) / 1024), // ~400 bytes per notification
    };
}

// Helper functions for creating specific types of notifications

export async function createStockUpdateNotification(
    productName: string, 
    basketName: string, 
    action: 'add' | 'remove', 
    oldStock: number,
    newStock: number,
    productId: string, 
    basketId: string,
    source: 'stock_modal' | 'sales' = 'stock_modal',
    minStock?: number
) {
    // Only send notification if it's from stock modal
    if (source !== 'stock_modal') return;
    
    const actionText = action === 'add' ? 'เพิ่ม' : 'ลด';
    const changeAmount = Math.abs(newStock - oldStock);
    
    // Base message
    let message = `${actionText}สต็อก ${productName} ใน ${basketName} จำนวน ${changeAmount} (${oldStock} → ${newStock})`;
    let notificationType: 'info' | 'warning' | 'error' = 'info';
    let title = "📦 อัปเดตสต็อก";
    
    // Check stock level and add warning if needed
    if (minStock !== undefined && minStock > 0) {
        if (newStock <= minStock) {
            // Critical stock level
            message += ` - 🚨 สต็อกวิกฤต! ควรปิดตะกร้านี้`;
            notificationType = 'error';
            title = "🚨 อัปเดตสต็อก - สต็อกวิกฤต";
        } else if (newStock <= minStock * 2) {
            // Low stock warning
            message += ` - ⚠️ สต็อกใกล้หมด!`;
            notificationType = 'warning';
            title = "⚠️ อัปเดตสต็อก - สต็อกใกล้หมด";
        }
    }
    
    return createNotification({
        title,
        message,
        type: notificationType,
        isRead: false,
        metadata: {
            productId,
            basketId,
            stockLevel: newStock,
            action: 'stock_update',
            source
        }
    });
}

export async function createLowStockWarning(productName: string, basketName: string, currentStock: number, minStock: number, productId: string, basketId: string, source: 'stock_modal' | 'sales' = 'sales') {
    // Only send notification if it's from sales
    if (source !== 'sales') return;
    
    return createNotification({
        title: "⚠️ สต็อกใกล้หมด",
        message: `${productName} ใน ${basketName} เหลือน้อย! ปัจจุบัน: ${currentStock}, ขั้นต่ำ: ${minStock}`,
        type: 'warning',
        isRead: false,
        metadata: {
            productId,
            basketId,
            stockLevel: currentStock,
            action: 'low_stock_warning',
            source
        }
    });
}

export async function createCriticalStockAlert(productName: string, basketName: string, currentStock: number, minStock: number, productId: string, basketId: string, source: 'stock_modal' | 'sales' = 'sales') {
    // Only send notification if it's from sales
    if (source !== 'sales') return;
    
    return createNotification({
        title: "🚨 สต็อกวิกฤต - แนะนำปิดตะกร้า",
        message: `${productName} ใน ${basketName} เหลือวิกฤต! ปัจจุบัน: ${currentStock}, ขั้นต่ำ: ${minStock} ควรปิดตะกร้านี้`,
        type: 'error',
        isRead: false,
        metadata: {
            productId,
            basketId,
            stockLevel: currentStock,
            action: 'critical_stock_alert',
            source
        }
    });
}
