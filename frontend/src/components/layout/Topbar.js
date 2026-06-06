"use client";
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';
import { useNotification } from '../../context/NotificationContext';
import { Sun, Moon, Bell, Menu, CheckCircle2 } from 'lucide-react';

export default function Topbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar } = useSidebar();
  const { notifications, markAsRead, markAllAsRead } = useNotification();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-14 border-b border-slate-200 dark:border-[#1a1f33] bg-white dark:bg-[#0b0f19] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 transition-colors duration-300">
      
      {/* Left side: Mobile menu toggle */}
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#151a2b] transition-colors mr-2 cursor-pointer"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-[#0b0f19]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#121629] rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => !notif.read && markAsRead(notif.id)}
                      className={`p-4 border-b border-slate-50 dark:border-white/5 cursor-pointer transition-colors ${notif.read ? 'bg-white dark:bg-[#121629]' : 'bg-indigo-50/50 dark:bg-indigo-900/20'}`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-0.5 shrink-0">
                          {notif.type === 'success' ? (
                            <CheckCircle2 size={16} className="text-emerald-500" />
                          ) : (
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500" />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm ${notif.read ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        {user && (
          <div className="flex items-center gap-3 pl-1 sm:pl-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'G'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-800 dark:text-white">{user?.full_name || user?.email?.split('@')[0] || 'Guest'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Free Plan</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
