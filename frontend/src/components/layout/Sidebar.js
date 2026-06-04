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
  Hexagon,
  Menu,
  ChevronDown,
  LogOut
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
    { name: 'Materials', href: '/materials', icon: Bookmark },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen w-[260px] bg-[#0b0f19] flex-shrink-0 z-50 fixed left-0 top-0 shadow-xl border-r border-[#1a1f33]">
      {/* Logo Area */}
      <div className="px-6 py-6 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm">
            <Hexagon size={18} className="text-white" fill="currentColor" />
          </div>
          <span className="text-white font-bold text-lg tracking-wide">IntelliHire</span>
        </div>
        <button className="text-slate-400 hover:text-white cursor-pointer transition-colors p-1 rounded-lg hover:bg-white/5 md:hidden">
          <Menu size={18} />
        </button>
      </div>

      <div className="px-6 pb-6 border-b border-[#1a1f33]">
        <p className="text-xs text-slate-400 font-medium tracking-wide">AI Hiring Assistant</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#151a2b]'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 mt-auto mb-2 border-t border-[#1a1f33]">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#121629] hover:bg-[#1a1f33] transition-colors cursor-default border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner border border-white/10">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'G'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate leading-tight">{user?.full_name || user?.email?.split('@')[0] || 'Guest'}</p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">Free Plan</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-red-400 transition-colors cursor-pointer" 
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
