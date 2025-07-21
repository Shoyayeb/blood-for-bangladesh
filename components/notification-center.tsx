'use client';

import { BloodRequestCard } from '@/components/blood-request-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { BLOOD_GROUP_DISPLAY } from '@/lib/types';
import { Bell, BellRing, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface BloodRequest {
  id: string;
  requesterName: string;
  requesterPhone: string;
  bloodGroup: keyof typeof BLOOD_GROUP_DISPLAY;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  hospital?: {
    id: string;
    name: string;
    address: string;
    zone: string;
    map_url: string;
  } | null;
  message?: string;
  createdAt: string;
  requesterCity: string;
  requesterState: string;
}

interface Notification {
  id: string;
  bloodRequest: BloodRequest;
  sentAt: string;
  readAt?: string;
  respondedAt?: string;
  response?: 'ACCEPTED' | 'DECLINED';
}

export function NotificationCenter() {
  const { user, firebaseUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      } else {
        setError('Failed to load notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [firebaseUser]);

  const markAsRead = async (notificationId: string) => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, readAt: new Date().toISOString() }
            : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const respondToRequest = async (notificationId: string, response: 'ACCEPTED' | 'DECLINED') => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      await fetch(`/api/notifications/${notificationId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ response }),
      });

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { 
                ...notif, 
                response, 
                respondedAt: new Date().toISOString(),
                readAt: notif.readAt || new Date().toISOString()
              }
            : notif
        )
      );
    } catch (err) {
      console.error('Error responding to request:', err);
    }
  };

  const refresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, [firebaseUser, fetchNotifications]);

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p>Please login to view notifications</p>
        </CardContent>
      </Card>
    );
  }

  const unreadCount = notifications.filter(n => !n.readAt).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-red-600" />
              <CardTitle>Blood Request Notifications</CardTitle>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={refresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <CardDescription>
            Blood requests that match your blood type and location
          </CardDescription>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="text-center py-8">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2 text-gray-400" />
            <p>Loading notifications...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-8 text-red-600">
            <p>{error}</p>
            <Button onClick={refresh} className="mt-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No blood request notifications</p>
            <p className="text-sm">You&apos;ll be notified when someone needs your blood type</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all ${
                !notification.readAt ? 'border-red-200 bg-red-50' : 'border-gray-200'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    {!notification.readAt && <BellRing className="w-4 h-4 text-red-500" />}
                    <span className="text-sm text-gray-600">
                      {new Date(notification.sentAt).toLocaleDateString('en-BD', {
                        timeZone: 'Asia/Dhaka',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {notification.response && (
                    <span className={`px-2 py-1 rounded text-xs ${
                      notification.response === 'ACCEPTED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {notification.response === 'ACCEPTED' ? 'Accepted' : 'Declined'}
                    </span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <BloodRequestCard
                  request={notification.bloodRequest}
                  showContactInfo={notification.response === 'ACCEPTED'}
                />
                
                {!notification.respondedAt && (
                  <div className="flex space-x-2 mt-4 pt-4 border-t">
                    <Button
                      onClick={() => {
                        markAsRead(notification.id);
                        respondToRequest(notification.id, 'ACCEPTED');
                      }}
                      className="flex-1"
                    >
                      Accept - I Can Donate
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        markAsRead(notification.id);
                        respondToRequest(notification.id, 'DECLINED');
                      }}
                      className="flex-1"
                    >
                      Cannot Donate
                    </Button>
                  </div>
                )}
                
                {!notification.readAt && notification.respondedAt && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as Read
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
