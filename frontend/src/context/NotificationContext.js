"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  
  // Ref to ensure we only welcome once per session
  const [hasWelcomed, setHasWelcomed] = useState(false);

  useEffect(() => {
    if (user && !hasWelcomed) {
      addNotification({
        title: 'Welcome back!',
        message: `Good to see you again, ${user.full_name || user.email?.split('@')[0] || 'Guest'}.`,
        type: 'info'
      });
      setHasWelcomed(true);
    }
  }, [user, hasWelcomed]);

  const addNotification = (notif) => {
    setNotifications(prev => [
      { id: Date.now() + Math.random(), read: false, timestamp: new Date(), ...notif },
      ...prev
    ]);
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
