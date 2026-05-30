"use client";
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell, ChevronDown } from 'lucide-react';

export default function Topbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-16 border-b border-[#6366f1]/10 flex items-center justify-end px-8 gap-4.5 bg-[#03030a]/80 backdrop-blur-xl sticky top-0 z-40">
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme} 
        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-all duration-300 border border-white/5"
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      {/* Notifications */}
      <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-all duration-300 border border-white/5 relative">
        <Bell size={17} />
        <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-pink-500 rounded-full text-[9px] font-black text-white flex items-center justify-center border-2 border-[#03030a] shadow-[0_0_10px_rgba(236,72,153,0.5)]">
          3
        </span>
      </button>

      {/* User Dropdown */}
      {user && (
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="w-8.5 h-8.5 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-extrabold text-xs shadow-[0_0_12px_rgba(20,184,166,0.2)]">
            {user.email?.[0]?.toUpperCase() || 'T'}
          </div>
          <span className="text-sm font-bold text-white tracking-wide flex items-center gap-1 cursor-pointer hover:text-indigo-300 transition-colors">
            {user.email?.split('@')[0].toUpperCase() || 'TEJA'}
            <ChevronDown size={14} className="text-slate-400" />
          </span>
        </div>
      )}
    </div>
  );
}
