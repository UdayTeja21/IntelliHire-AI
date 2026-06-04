// Auth context for global state management
"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pendingLogoutAction, setPendingLogoutAction] = useState(null);

  useEffect(() => {
    const handlePopState = () => {
      // If user is logged in and they hit back button to go to login or register page
      if (user && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
        // Prevent navigation by immediately going forward
        window.history.forward();
        setPendingLogoutAction('popstate');
        setShowLogoutModal(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    setPendingLogoutAction('button');
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowLogoutModal(false);
    router.push('/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
    setPendingLogoutAction(null);
  };

  const updateUser = (newUserData) => {
    localStorage.setItem('user', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const logoutModal = showLogoutModal && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to leave?</h3>
          <p className="text-slate-500 text-sm">Are you sure you want to logout of your account? You will need to login again to access your dashboard.</p>
        </div>
        <div className="flex border-t border-slate-100">
          <button onClick={cancelLogout} className="flex-1 py-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-100">
            Cancel
          </button>
          <button onClick={confirmLogout} className="flex-1 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser: updateUser }}>
      {children}
      {logoutModal}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
