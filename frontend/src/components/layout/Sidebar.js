"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { 
  LayoutDashboard, 
  FileText, 
  Mic, 
  History, 
  BarChart2, 
  Bookmark, 
  Settings, 
  Hexagon,
  X,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isMobileOpen, isCollapsed, closeSidebar } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);

  const navLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Resume Analyzer', href: '/resume', icon: FileText },
    { name: 'Mock Interview', href: '/interview', icon: Mic },
    { name: 'Interview History', href: '/history', icon: History },
    { name: 'Reports', href: '/reports', icon: BarChart2 },
    { name: 'Materials', href: '/materials', icon: Bookmark },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const effectivelyCollapsed = isCollapsed && !isHovered;
  const widthClass = effectivelyCollapsed ? 'w-[80px]' : 'w-[260px]';

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      <div 
        className={`flex flex-col h-screen ${widthClass} bg-[#0b0f19] flex-shrink-0 z-50 fixed left-0 top-0 shadow-xl border-r border-[#1a1f33] transition-all duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo Area */}
        <div className={`px-6 py-6 mb-2 flex items-center ${effectivelyCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm shrink-0">
              <Hexagon size={18} className="text-white" fill="currentColor" />
            </div>
            {!effectivelyCollapsed && (
              <span className="text-white font-bold text-lg tracking-wide transition-opacity duration-300">IntelliHire</span>
            )}
          </div>
          {!effectivelyCollapsed && (
            <button 
              onClick={closeSidebar}
              className="text-slate-400 hover:text-white cursor-pointer transition-colors p-1 rounded-lg hover:bg-white/5 md:hidden"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {!effectivelyCollapsed && (
          <div className="px-6 pb-6 border-b border-[#1a1f33]">
            <p className="text-xs text-slate-400 font-medium tracking-wide whitespace-nowrap">AI Hiring Assistant</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                title={effectivelyCollapsed ? link.name : ''}
                className={`flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151a2b]'
                } ${effectivelyCollapsed ? 'justify-center px-0 mx-2' : 'px-4'}`}
              >
                <Icon size={18} className={isActive ? 'text-white shrink-0' : 'text-slate-400 shrink-0'} />
                {!effectivelyCollapsed && <span className="whitespace-nowrap transition-opacity duration-300">{link.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 mt-auto mb-2 border-t border-[#1a1f33]">
          <div className={`flex items-center p-3 rounded-2xl bg-[#121629] hover:bg-[#1a1f33] transition-colors cursor-default border border-white/5 ${effectivelyCollapsed ? 'justify-center px-0 mx-1' : 'justify-between'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner border border-white/10" title={user?.full_name || 'Guest'}>
                {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'G'}
              </div>
              {!effectivelyCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate leading-tight">{user?.full_name || user?.email?.split('@')[0] || 'Guest'}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5 whitespace-nowrap">Free Plan</p>
                </div>
              )}
            </div>
            {!effectivelyCollapsed && (
              <button 
                onClick={logout} 
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-red-400 transition-colors cursor-pointer shrink-0" 
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
