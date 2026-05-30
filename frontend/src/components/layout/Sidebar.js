"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Mic, 
  History, 
  BarChart2, 
  Bookmark, 
  Settings, 
  LogOut,
  Hexagon,
  Menu
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Resume Analyzer', href: '/resume', icon: FileText },
    { name: 'Mock Interview', href: '/interview', icon: Mic },
    { name: 'Interview History', href: '/history', icon: History },
    { name: 'Reports', href: '/reports', icon: BarChart2 },
    { name: 'Saved Materials', href: '/materials', icon: Bookmark },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen w-[260px] bg-[#070611]/90 backdrop-blur-2xl border-r border-[#6366f1]/15 flex-shrink-0 z-50 fixed left-0 top-0 pt-6 pb-6 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.7)]">
      {/* Logo Area */}
      <div className="px-6 mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/35 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Hexagon size={20} className="text-indigo-400 animate-pulse" />
          </div>
          <span className="text-white font-extrabold text-lg tracking-wider font-sans">IntelliHire</span>
        </div>
        <button className="text-slate-400 hover:text-white cursor-pointer transition-colors p-1 rounded-lg hover:bg-white/5 md:hidden">
          <Menu size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-350 cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 text-white shadow-[0_4px_20px_-2px_rgba(99,102,241,0.45)] border-t border-white/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'text-slate-400'} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="px-4 mt-auto">
          <div className="p-4.5 rounded-2xl bg-white/[0.03] border border-white/[0.04] backdrop-blur-md shadow-2xl relative overflow-hidden group">
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex items-center gap-3.5 mb-4 relative z-10">
              <div className="w-11 h-11 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold shrink-0 shadow-[0_0_15px_rgba(20,184,166,0.15)] text-base font-sans">
                {user.email?.[0]?.toUpperCase() || 'T'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white tracking-wide truncate">{user.email?.split('@')[0].toUpperCase() || 'TEJA'}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{user.email || 'Teja@gmail.com'}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/5 hover:border-red-500/20 text-xs font-bold text-slate-300 cursor-pointer transition-all duration-300 relative z-10"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
