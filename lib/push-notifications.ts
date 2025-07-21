// Push notification utilities for Blood for Bangladesh PWA

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Request notification permission and subscribe to push notifications
export async function requestNotificationPermission(): Promise<PushSubscription | null> {
  // Check if notifications are supported
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return null;
  }

  // Check if service worker is supported
  if (!('serviceWorker' in navigator)) {
    console.warn('This browser does not support service workers');
    return null;
  }

  // Check if push messaging is supported
  if (!('PushManager' in window)) {
    console.warn('This browser does not support push messaging');
    return null;
  }

  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
    });

    // Convert to our format
    const pushSubscription: PushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!)
      }
    };

    return pushSubscription;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
}

// Check current notification permission status
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

// Check if push notifications are supported
export function isPushNotificationSupported(): boolean {
  return 'Notification' in window && 
         'serviceWorker' in navigator && 
         'PushManager' in window;
}

// Send a test notification
export function sendTestNotification(title: string, body: string, data?: unknown) {
  if (getNotificationPermission() === 'granted') {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        body,
        icon: '/android-chrome-192x192.png',
        badge: '/favicon-32x32.png',
        data,
        tag: 'test-notification'
      });
    });
  }
}

// Save push subscription to server
export async function savePushSubscription(subscription: PushSubscription, userToken: string): Promise<boolean> {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(subscription)
    });

    return response.ok;
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return false;
  }
}

// Utility functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
