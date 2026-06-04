"use client";
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, KeyRound, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '../../components/Toast';

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [savedEmail, setSavedEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      if (step === 1) {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgot-password`, {
          email: data.email
        });
        setSavedEmail(data.email);
        setStep(2);
        toast({
          type: 'success',
          title: 'OTP Sent',
          message: 'Please check your email for the 6-digit code.',
        });
      } else {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify-otp`, {
          email: savedEmail,
          otp: data.otp
        });
        toast({
          type: 'success',
          title: 'OTP Verified',
          message: 'Redirecting to reset your password...',
        });
        router.push(`/reset-password?token=${response.data.token}`);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass p-8 rounded-3xl shadow-2xl shadow-black/50 border border-white/10"
        >
          <button 
            onClick={() => step === 2 ? setStep(1) : router.push('/login')} 
            className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} className="mr-2" /> {step === 2 ? 'Back to email' : 'Back to login'}
          </button>

          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/30 mb-5"
            >
              {step === 1 ? <Mail size={32} className="text-white" /> : <KeyRound size={32} className="text-white" />}
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {step === 1 ? 'Forgot Password?' : 'Enter OTP'}
            </h1>
            <p className="text-slate-400 text-sm">
              {step === 1 
                ? "No worries, we'll send you a verification code." 
                : `We've sent a 6-digit code to ${savedEmail}`}
            </p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2"
            >
              <span className="flex-shrink-0">⚠️</span>
              {errorMsg}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {step === 1 ? (
              <div key="email-step">
                <label className="label">Email address</label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                  })}
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1.5 text-xs text-rose-400">{errors.email.message}</p>}
              </div>
            ) : (
              <div key="otp-step">
                <label className="label">6-Digit Code</label>
                <input
                  {...register('otp', {
                    required: 'OTP is required',
                    pattern: { value: /^\d{6}$/, message: 'Must be a 6-digit number' }
                  })}
                  type="text"
                  maxLength={6}
                  className="input-field text-center text-xl tracking-[0.5em] font-mono"
                  placeholder="------"
                  autoComplete="one-time-code"
                />
                {errors.otp && <p className="mt-1.5 text-xs text-rose-400 text-center">{errors.otp.message}</p>}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  {step === 1 ? 'Send Code' : 'Verify & Reset Password'}
                </>
              )}
            </button>
          </form>
          
          {step === 2 && (
             <div className="text-center mt-6">
               <p className="text-sm text-slate-400 mb-2">
                 Did not receive the code?
               </p>
               <button 
                 type="button"
                 onClick={() => {
                   setStep(1);
                   setErrorMsg('');
                 }} 
                 className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors text-sm"
               >
                 Try another email address
               </button>
             </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
