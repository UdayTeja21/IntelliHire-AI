"use client";
import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const icons = {
  success: { icon: CheckCircle, color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  error:   { icon: XCircle,     color: '#f87171', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)'  },
  warning: { icon: AlertTriangle,color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',border: 'rgba(245,158,11,0.25)' },
  info:    { icon: Info,         color: '#818cf8', bg: 'rgba(99,102,241,0.12)',border: 'rgba(99,102,241,0.25)' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, message, type = 'success', duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: '380px', width: '100%' }}>
        <AnimatePresence>
          {toasts.map((t) => {
            const cfg = icons[t.type];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{
                  background: 'rgba(15,23,42,0.92)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${cfg.border}`,
                  borderRadius: '14px',
                  boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${cfg.border}`,
                  pointerEvents: 'all',
                }}
                className="flex items-start gap-4 p-4 w-full"
              >
                {/* Left bar */}
                <div style={{ width: 3, borderRadius: 9999, background: cfg.color, alignSelf: 'stretch', flexShrink: 0 }} />

                {/* Icon */}
                <div style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }}>
                  <Icon size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {t.title && (
                    <p style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem', marginBottom: t.message ? 2 : 0 }}>
                      {t.title}
                    </p>
                  )}
                  {t.message && (
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.5 }}>
                      {t.message}
                    </p>
                  )}
                </div>

                {/* Dismiss */}
                <button
                  onClick={() => dismiss(t.id)}
                  style={{ color: '#475569', flexShrink: 0, marginTop: 1 }}
                  className="hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
