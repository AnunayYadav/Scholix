import { create } from 'zustand';
import NexusServer from '../services/nexusServer';
import { NexusNotification } from '../types';

interface NotificationState {
  personalNotifications: NexusNotification[];
  globalAnnouncements: any[];
  isSubscribed: boolean;
  currentUserId: string | null;
  cleanups: (() => void)[];
  
  fetchAndSubscribe: (userId: string | null) => Promise<void>;
  unsubscribe: () => void;
  markAllAsRead: (userId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  addPersonalNotification: (newNotif: NexusNotification) => void;
  addGlobalAnnouncement: (newAnn: any) => void;
}

const triggerBrowserNotification = (title: string, body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: '/favicon.ico' // Updated from /logo.png to match existing assets
    });
  }
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  personalNotifications: [],
  globalAnnouncements: [],
  isSubscribed: false,
  currentUserId: null,
  cleanups: [],

  fetchAndSubscribe: async (userId: string | null) => {
    const state = get();
    
    // Request permission if not already granted/denied
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // If already subscribed to the same user profile, no need to re-fetch/re-subscribe
    if (state.isSubscribed && state.currentUserId === userId) {
      return;
    }

    // If subscribed to a different user, unsubscribe first
    if (state.isSubscribed) {
      state.unsubscribe();
    }

    const newCleanups: (() => void)[] = [];

    // 1. Fetch and Subscribe Global Announcements
    try {
      const globals = await NexusServer.fetchGlobalAnnouncements();
      set({ globalAnnouncements: globals });
    } catch (err) {
      console.error('Error fetching global announcements:', err);
    }

    const unsubGlobal = NexusServer.subscribeToGlobalAnnouncements((newAnn) => {
      const { globalAnnouncements } = get();
      if (globalAnnouncements.some((g) => g.id === newAnn.id)) return;
      
      triggerBrowserNotification(newAnn.title, newAnn.message);
      set({ globalAnnouncements: [newAnn, ...globalAnnouncements] });
    });
    newCleanups.push(unsubGlobal);

    // 2. Fetch and Subscribe Personal Notifications (if user is logged in)
    if (userId) {
      try {
        const personals = await NexusServer.fetchNotifications(userId);
        set({ personalNotifications: personals });
      } catch (err) {
        console.error('Error fetching personal notifications:', err);
      }

      const unsubPersonal = NexusServer.subscribeToNotifications(userId, (newNotif) => {
        const { personalNotifications } = get();
        if (personalNotifications.some((p) => p.id === newNotif.id)) return;
        
        triggerBrowserNotification(newNotif.title, newNotif.message);
        set({ personalNotifications: [newNotif, ...personalNotifications] });
      });
      newCleanups.push(unsubPersonal);
    } else {
      set({ personalNotifications: [] });
    }

    set({
      isSubscribed: true,
      currentUserId: userId,
      cleanups: newCleanups,
    });
  },

  unsubscribe: () => {
    const { cleanups } = get();
    cleanups.forEach((cleanup) => {
      try {
        cleanup();
      } catch (e) {
        console.warn('Error during notification cleanup:', e);
      }
    });
    set({
      personalNotifications: [],
      globalAnnouncements: [],
      isSubscribed: false,
      currentUserId: null,
      cleanups: [],
    });
  },

  markAllAsRead: async (userId: string) => {
    try {
      await NexusServer.markAllNotificationsAsRead(userId);
      set((state) => ({
        personalNotifications: state.personalNotifications.map((n) => ({ ...n, read: true })),
      }));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  },

  markNotificationAsRead: async (notificationId: string) => {
    try {
      await NexusServer.markNotificationAsRead(notificationId);
      set((state) => ({
        personalNotifications: state.personalNotifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
      }));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  },

  addPersonalNotification: (newNotif: NexusNotification) => {
    set((state) => {
      if (state.personalNotifications.some((p) => p.id === newNotif.id)) return state;
      triggerBrowserNotification(newNotif.title, newNotif.message);
      return { personalNotifications: [newNotif, ...state.personalNotifications] };
    });
  },

  addGlobalAnnouncement: (newAnn: any) => {
    set((state) => {
      if (state.globalAnnouncements.some((g) => g.id === newAnn.id)) return state;
      triggerBrowserNotification(newAnn.title, newAnn.message);
      return { globalAnnouncements: [newAnn, ...state.globalAnnouncements] };
    });
  },
}));
