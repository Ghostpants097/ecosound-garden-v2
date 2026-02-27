'use client';

import { useState, useEffect } from 'react';
import { notificationManager, Notification } from '@/lib/notifications';

export default function NotificationToast() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationManager.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`rounded-lg border p-4 shadow-lg animate-slide-in ${getColorClasses(notification.type)}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg font-bold">{getIcon(notification.type)}</span>
            <div className="flex-1">
              <h3 className="font-semibold">{notification.title}</h3>
              <p className="text-sm opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() => notificationManager.remove(notification.id)}
              className="text-lg opacity-60 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
