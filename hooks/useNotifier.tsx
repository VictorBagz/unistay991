import React, { createContext, useContext, useState, useCallback } from 'react';

interface NotificationPayload {
  message: any; // Can be a string or an error object
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export interface Notification extends Omit<NotificationPayload, 'message'> {
  id: number;
  message: string; // Message is always a string after processing
}

interface NotificationContextType {
  notifications: Notification[];
  notify: (payload: NotificationPayload) => void;
  removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const notify = useCallback(({ message, type, duration = 5000 }: NotificationPayload) => {
        const id = Date.now();
        
        // --- FIX for [object Object] ---
        // Safely extract a string message from a potential error object
        let safeMessage = 'An unknown error occurred.';
        if (typeof message === 'string') {
            safeMessage = message;
        } else if (typeof message === 'object' && message !== null && message.message) {
            safeMessage = message.message;
        } else if (typeof message === 'object' && message !== null) {
            safeMessage = JSON.stringify(message);
        }

        setNotifications(prev => [...prev, { id, message: safeMessage, type, duration }]);
        
        const timer = setTimeout(() => {
            removeNotification(id);
        }, duration);
        
        // Add a cleanup function to the notification object if needed, but this is simpler
    }, [removeNotification]);

    return (
        <NotificationContext.Provider value={{ notifications, notify, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifier = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifier must be used within a NotificationProvider');
    }
    return context;
};
