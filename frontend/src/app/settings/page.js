"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Shield, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

export default function Settings() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Profile State
  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('');

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preferences State
  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    interviewReminders: true,
    weeklyReports: false,
    shareAnalytics: true,
    dataProcessing: true
  });

  useEffect(() => {
    if (!user) return; // Only fetch when context has a user
    
    let isMounted = true;
    
    // Safety fallback: if request takes longer than 5s, stop loading and show UI
    const fallbackTimer = setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 5000);

    const fetchUserData = async () => {
      try {
        const res = await api.get('/user/me');
        if (!isMounted) return;
        
        setFullName(res.data?.full_name || '');
        setTargetRole(res.data?.target_role || '');
        if (res.data?.preferences && typeof res.data.preferences === 'object') {
          setPreferences(prev => ({ ...prev, ...res.data.preferences }));
        }
      } catch (err) {
        if (isMounted) console.error("Failed to load user data:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          clearTimeout(fallbackTimer);
        }
      }
    };
    
    fetchUserData();
    
    return () => { 
      isMounted = false; 
      clearTimeout(fallbackTimer);
    };
  }, [user]);

  const showToastMsg = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api.put('/user/profile', {
        full_name: fullName,
        target_role: targetRole
      });
      // Update global user context if needed
      if (user) {
        setUser({ ...user, full_name: fullName });
      }
      showToastMsg('Profile saved successfully!');
    } catch (err) {
      showToastMsg('Failed to save profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToastMsg('New passwords do not match.', 'error');
      return;
    }
    if (!newPassword) {
      showToastMsg('Please fill all password fields.', 'error');
      return;
    }
    
    setIsSaving(true);
    try {
      await api.put('/user/password', {
        new_password: newPassword
      });
      showToastMsg('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToastMsg(err.response?.data?.detail || 'Failed to update password.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePreference = async (key) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    
    try {
      await api.put('/user/profile', { preferences: newPrefs });
      showToastMsg('Preference updated!', 'success');
    } catch (err) {
      // Revert on error
      setPreferences(preferences);
      showToastMsg('Failed to update preference.', 'error');
    }
  };

  const TabButton = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
        activeTab === id 
          ? 'bg-[#3b59df] text-white shadow-md' 
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1a1f33]'
      }`}
    >
      <Icon size={18} /> {label}
    </button>
  );

  const ToggleSwitch = ({ label, description, isChecked, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#121629] rounded-xl border border-slate-100 dark:border-white/5">
      <div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{description}</p>
      </div>
      <button 
        onClick={onChange}
        className={`w-11 h-6 rounded-full transition-colors relative ${isChecked ? 'bg-indigo-500' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-all ${isChecked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );

  if (!user) return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center gap-6 text-center max-w-md mx-auto fade-in">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-md animate-float">
        <SettingsIcon size={32} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 font-sans">Sign in to manage settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Please sign in to access and update your account preferences.</p>
      </div>
      <div className="flex gap-4.5 w-full mt-3">
        <button onClick={() => router.push('/login')} className="flex-1 py-2.5 bg-[#3b59df] text-white rounded-xl font-bold hover:bg-[#2c45b8] transition-colors">Sign In</button>
        <button onClick={() => router.push('/register')} className="flex-1 py-2.5 bg-white dark:bg-[#121629] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-[#1a1f33] transition-colors">Create Account</button>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="py-20 text-center font-bold text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="py-6 space-y-6 relative max-w-6xl mx-auto fade-in">
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border ${
              toast.type === 'error' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span className="text-sm font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm">
          <SettingsIcon className="text-slate-600 dark:text-slate-400" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 text-sm">Manage your account preferences and configurations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Sidebar */}
        <div className="space-y-2">
          <TabButton id="profile" icon={User} label="Profile" />
          <TabButton id="password" icon={Key} label="Password" />
          <TabButton id="notifications" icon={Bell} label="Notifications" />
          <TabButton id="privacy" icon={Shield} label="Privacy" />
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="bg-white dark:bg-[#121629] rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Profile Information</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-white/5">
                    <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-3xl text-indigo-600 dark:text-indigo-400 font-bold shadow-sm border border-indigo-200 dark:border-indigo-500/30">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <button className="px-4 py-2.5 bg-white dark:bg-[#1a1f33] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#252b43] text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors shadow-sm">
                        Change Avatar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-50 dark:bg-[#1a1f33] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                      <input type="email" value={user?.email || ''} disabled className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-500 dark:text-slate-500 font-medium cursor-not-allowed shadow-sm" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Target Role</label>
                      <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Senior Frontend Developer" className="w-full bg-slate-50 dark:bg-[#1a1f33] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm" />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button onClick={handleSaveProfile} disabled={isSaving} className="px-8 py-3 bg-[#3b59df] hover:bg-[#2c45b8] disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center min-w-[150px]">
                      {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PASSWORD TAB */}
            {activeTab === 'password' && (
              <motion.div key="password" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="bg-white dark:bg-[#121629] rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Security Settings</h2>
                <div className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-[#1a1f33] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-[#1a1f33] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm" />
                  </div>

                  <div className="pt-4">
                    <button onClick={handleSavePassword} disabled={isSaving} className="px-8 py-3 bg-[#3b59df] hover:bg-[#2c45b8] disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center w-full">
                      {isSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="bg-white dark:bg-[#121629] rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Notification Preferences</h2>
                <div className="space-y-4 max-w-xl">
                  <ToggleSwitch 
                    label="Email Alerts" 
                    description="Receive email notifications for platform updates and tips."
                    isChecked={preferences.emailAlerts}
                    onChange={() => handleTogglePreference('emailAlerts')}
                  />
                  <ToggleSwitch 
                    label="Interview Reminders" 
                    description="Get notified to practice mock interviews regularly."
                    isChecked={preferences.interviewReminders}
                    onChange={() => handleTogglePreference('interviewReminders')}
                  />
                  <ToggleSwitch 
                    label="Weekly Reports" 
                    description="Receive a weekly summary of your interview performance."
                    isChecked={preferences.weeklyReports}
                    onChange={() => handleTogglePreference('weeklyReports')}
                  />
                </div>
              </motion.div>
            )}

            {/* PRIVACY TAB */}
            {activeTab === 'privacy' && (
              <motion.div key="privacy" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="bg-white dark:bg-[#121629] rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Privacy & Data Settings</h2>
                <div className="space-y-4 max-w-xl">
                  <ToggleSwitch 
                    label="Share Analytics" 
                    description="Allow anonymous usage data to help us improve the AI models."
                    isChecked={preferences.shareAnalytics}
                    onChange={() => handleTogglePreference('shareAnalytics')}
                  />
                  <ToggleSwitch 
                    label="Data Processing" 
                    description="Allow your resume data to be processed for personalized insights."
                    isChecked={preferences.dataProcessing}
                    onChange={() => handleTogglePreference('dataProcessing')}
                  />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
