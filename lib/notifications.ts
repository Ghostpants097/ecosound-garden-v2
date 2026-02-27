'use client';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // ms, 0 = persistent
}

class NotificationManager {
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private notifications: Notification[] = [];
  private notificationId = 0;

  subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(callback => callback(this.notifications));
  }

  add(notification: Omit<Notification, 'id'>) {
    const id = String(++this.notificationId);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    this.notifications.push(newNotification);
    this.notify();

    if (newNotification.duration > 0) {
      setTimeout(() => this.remove(id), newNotification.duration);
    }

    return id;
  }

  remove(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }

  success(title: string, message: string) {
    return this.add({ type: 'success', title, message });
  }

  error(title: string, message: string) {
    return this.add({ type: 'error', title, message, duration: 7000 });
  }

  warning(title: string, message: string) {
    return this.add({ type: 'warning', title, message, duration: 6000 });
  }

  info(title: string, message: string) {
    return this.add({ type: 'info', title, message });
  }

  getAll() {
    return this.notifications;
  }
}

export const notificationManager = new NotificationManager();
