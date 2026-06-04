"use client";
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell } from 'lucide-react';

export default function Topbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-end px-8 sticky top-0 z-40">

      {/* Right Actions */}
      <div className="flex items-center gap-5">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <Sun size={18} />
        </button>

        {/* Notifications */}
        <button className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors relative">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
            3
          </span>
        </button>

        {/* User Profile */}
        {user && (
          <div className="flex items-center gap-3 pl-3">
            <div className="w-10 h-10 rounded-full bg-[#3b59df] flex items-center justify-center text-white font-bold text-sm">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'G'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{user?.full_name || user?.email?.split('@')[0] || 'Guest'}</p>
              <p className="text-xs text-slate-500 font-medium">Free Plan</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
