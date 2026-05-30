"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Shield, Key, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || 'Uday Teja');
    }
    const savedRole = localStorage.getItem('targetRole');
    if (savedRole) setTargetRole(savedRole);
  }, [user]);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('targetRole', targetRole);
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  return (
    <div className="py-6 space-y-6 relative">
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 right-0 bg-teal-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle size={18} />
            <span className="text-sm font-semibold">Settings saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-500/20 flex items-center justify-center border border-slate-500/30">
          <SettingsIcon className="text-slate-400" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 text-sm">Manage your account preferences and configurations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Sidebar */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium shadow-[0_0_15px_rgba(79,70,229,0.2)]">
            <User size={18} /> Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-medium transition-colors">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-medium transition-colors">
            <Shield size={18} /> Privacy
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-medium transition-colors">
            <Key size={18} /> Password
          </button>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-8 border border-white/5">
            <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                <div className="w-20 h-20 rounded-full bg-teal-500 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/10">
                    Change Avatar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#0a0a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Email Address</label>
                  <input type="email" value={user?.email || 'test@example.com'} disabled className="w-full bg-[#050511] border border-white/5 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-400">Target Role</label>
                  <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Senior Frontend Developer" className="w-full bg-[#0a0a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)] flex items-center justify-center min-w-[140px]"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
