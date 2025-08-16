"use client";
import { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Divider, Chip } from '@heroui/react';
import { cleanupOldNotifications, cleanupReadNotifications, getNotificationsStats } from '../../services/notifications';

interface NotificationStats {
    total: number;
    oldNotifications: number;
    oldReadNotifications: number;
    estimatedSizeKB: number;
}

export default function NotificationCleanup() {
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [lastCleanup, setLastCleanup] = useState<any>(null);

    const loadStats = async () => {
        try {
            const data = await getNotificationsStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading notification stats:', error);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const handleCleanupOld = async (days: number) => {
        if (!window.confirm(`Delete all notifications older than ${days} days?`)) return;
        
        setLoading(true);
        try {
            const result = await cleanupOldNotifications(days);
            setLastCleanup(result);
            await loadStats(); // Refresh stats
            alert(`Deleted ${result.deletedCount} old notifications`);
        } catch (error) {
            console.error('Error cleaning up old notifications:', error);
            alert('Error cleaning up notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleCleanupRead = async (days: number) => {
        if (!window.confirm(`Delete all read notifications older than ${days} days?`)) return;
        
        setLoading(true);
        try {
            const result = await cleanupReadNotifications(days);
            setLastCleanup(result);
            await loadStats(); // Refresh stats
            alert(`Deleted ${result.deletedCount} read notifications`);
        } catch (error) {
            console.error('Error cleaning up read notifications:', error);
            alert('Error cleaning up notifications');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center w-full">
                        <h1 className="text-2xl font-bold">🧹 Notification Cleanup</h1>
                        <div className="text-sm text-gray-500">Owner Access Only</div>
                    </div>
                </CardHeader>
                <CardBody className="space-y-6">
                    {/* Stats Section */}
                    <div>
                        <h2 className="text-lg font-semibold mb-3">📊 Current Stats</h2>
                        {stats ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card>
                                    <CardBody className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{stats.total.toLocaleString()}</div>
                                        <div className="text-sm text-gray-600">Total Notifications</div>
                                    </CardBody>
                                </Card>
                                <Card>
                                    <CardBody className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">{stats.oldNotifications.toLocaleString()}</div>
                                        <div className="text-sm text-gray-600">Old (&gt;30 days)</div>
                                    </CardBody>
                                </Card>
                                <Card>
                                    <CardBody className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{stats.oldReadNotifications.toLocaleString()}</div>
                                        <div className="text-sm text-gray-600">Read &amp; Old (&gt;7 days)</div>
                                    </CardBody>
                                </Card>
                                <Card>
                                    <CardBody className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">{stats.estimatedSizeKB}</div>
                                        <div className="text-sm text-gray-600">Estimated KB</div>
                                    </CardBody>
                                </Card>
                            </div>
                        ) : (
                            <div>Loading stats...</div>
                        )}
                    </div>

                    <Divider />

                    {/* Cleanup Actions */}
                    <div>
                        <h2 className="text-lg font-semibold mb-3">🗑️ Cleanup Actions</h2>
                        <div className="space-y-4">
                            {/* Clean Old Notifications */}
                            <Card>
                                <CardBody>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <h3 className="font-semibold">Delete Old Notifications</h3>
                                            <p className="text-sm text-gray-600">Remove all notifications older than specified days</p>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            <Button 
                                                color="warning" 
                                                variant="flat"
                                                size="sm"
                                                onPress={() => handleCleanupOld(7)}
                                                isDisabled={loading}
                                            >
                                                7 days
                                            </Button>
                                            <Button 
                                                color="warning" 
                                                variant="flat"
                                                size="sm"
                                                onPress={() => handleCleanupOld(30)}
                                                isDisabled={loading}
                                            >
                                                30 days
                                            </Button>
                                            <Button 
                                                color="warning" 
                                                variant="flat"
                                                size="sm"
                                                onPress={() => handleCleanupOld(90)}
                                                isDisabled={loading}
                                            >
                                                90 days
                                            </Button>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Clean Read Notifications */}
                            <Card>
                                <CardBody>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <h3 className="font-semibold">Delete Read Notifications</h3>
                                            <p className="text-sm text-gray-600">Remove read notifications older than specified days</p>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            <Button 
                                                color="success" 
                                                variant="flat"
                                                size="sm"
                                                onPress={() => handleCleanupRead(3)}
                                                isDisabled={loading}
                                            >
                                                3 days
                                            </Button>
                                            <Button 
                                                color="success" 
                                                variant="flat"
                                                size="sm"
                                                onPress={() => handleCleanupRead(7)}
                                                isDisabled={loading}
                                            >
                                                7 days
                                            </Button>
                                            <Button 
                                                color="success" 
                                                variant="flat"
                                                size="sm"
                                                onPress={() => handleCleanupRead(14)}
                                                isDisabled={loading}
                                            >
                                                14 days
                                            </Button>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>

                    {/* Last Cleanup Result */}
                    {lastCleanup && (
                        <>
                            <Divider />
                            <div>
                                <h2 className="text-lg font-semibold mb-3">✅ Last Cleanup Result</h2>
                                <div className="flex gap-4 items-center">
                                    <Chip color="success" variant="flat">
                                        Deleted: {lastCleanup.deletedCount} notifications
                                    </Chip>
                                    <span className="text-sm text-gray-600">
                                        Before: {new Date(lastCleanup.cutoffDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Refresh Stats */}
                    <Divider />
                    <div className="flex justify-center">
                        <Button 
                            color="primary" 
                            variant="flat"
                            onPress={loadStats}
                            isDisabled={loading}
                        >
                            🔄 Refresh Stats
                        </Button>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">💡 Recommendations:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Clean read notifications every 7 days to save space</li>
                            <li>• Keep old notifications for 30 days for historical purposes</li>
                            <li>• Run cleanup weekly for optimal performance</li>
                            <li>• Monitor storage usage regularly</li>
                        </ul>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
