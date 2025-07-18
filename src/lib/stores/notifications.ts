import { writable } from 'svelte/store';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  actions?: {
    label: string;
    action: () => void;
  }[];
}

function createNotificationStore() {
  const { subscribe, update } = writable<Notification[]>([]);

  function addNotification(notification: Omit<Notification, 'id'>) {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000,
      dismissible: true,
      ...notification
    };

    update(notifications => [...notifications, newNotification]);

    // Auto-remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }

  function removeNotification(id: string) {
    update(notifications => notifications.filter(n => n.id !== id));
  }

  function clearAll() {
    update(() => []);
  }

  // Convenience methods
  function success(title: string, message?: string, options?: Partial<Notification>) {
    return addNotification({ type: 'success', title, message, ...options });
  }

  function error(title: string, message?: string, options?: Partial<Notification>) {
    return addNotification({ type: 'error', title, message, duration: 0, ...options });
  }

  function warning(title: string, message?: string, options?: Partial<Notification>) {
    return addNotification({ type: 'warning', title, message, ...options });
  }

  function info(title: string, message?: string, options?: Partial<Notification>) {
    return addNotification({ type: 'info', title, message, ...options });
  }

  return {
    subscribe,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };
}

export const notifications = createNotificationStore();