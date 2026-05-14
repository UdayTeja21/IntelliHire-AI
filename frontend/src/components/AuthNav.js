"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthNav() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const checkAuth = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    router.push('/login');
  };

  if (user) {
    return (
      <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-700">
        <span className="text-slate-300 text-sm">{user.full_name}</span>
        <button 
          onClick={handleLogout}
          className="text-sm text-slate-400 hover:text-rose-400 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-700">
      <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">Sign In</Link>
      <Link href="/register" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign Up</Link>
    </div>
  );
}
