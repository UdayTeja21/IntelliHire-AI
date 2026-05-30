"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, LayoutDashboard, FileText, Mic, LogIn, LogOut, UserPlus, User, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/resume', label: 'Resume Analyzer', icon: FileText },
  { href: '/interview', label: 'Mock Interview', icon: Mic },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-black/10 dark:border-white/10 shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center shadow-sm">
              <BrainCircuit size={18} className="text-white dark:text-black" />
            </div>
            <span className="text-lg font-bold text-black dark:text-white tracking-tight">
              IntelliHire
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  pathname === href
                    ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                  <div className="w-6 h-6 rounded-full bg-black dark:bg-white flex items-center justify-center text-xs font-bold text-white dark:text-black">
                    {user.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{user.full_name?.split(' ')[0]}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  <LogIn size={16} />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
                >
                  <UserPlus size={16} />
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <button className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-white/10 pt-4">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${pathname === href ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon size={16} /> {label}
              </Link>
            ))}
            {user ? (
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10">
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white">
                  <LogIn size={16} /> Sign In
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <UserPlus size={16} /> Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
