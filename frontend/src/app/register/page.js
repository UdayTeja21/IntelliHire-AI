"use client";
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import axios from 'axios';
import { BrainCircuit, UserPlus, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const password = watch('password', '');

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  const passwordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'][strength];

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await axios.post('http://localhost:8000/api/v1/auth/register', {
        email: data.email,
        password: data.password,
        full_name: data.full_name
      });
      login(response.data.user, response.data.access_token);
      toast({
        type: 'success',
        title: `Account created! 🎉`,
        message: `Welcome aboard, ${response.data.user.full_name?.split(' ')[0]}! Start your first mock interview.`,
        duration: 5000,
      });
      router.push('/');
    } catch (error) {
      setErrorMsg(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = ['AI-powered mock interviews', 'ATS resume scoring', 'Real-time feedback'];

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass p-8 rounded-3xl shadow-2xl shadow-black/50 border border-white/10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-xl shadow-purple-500/30 mb-5"
            >
              <UserPlus size={30} className="text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-slate-400 text-sm">Start mastering interviews with AI today</p>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4">
              {features.map((f) => (
                <span key={f} className="flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle size={12} /> {f}
                </span>
              ))}
            </div>
          </div>

          {errorMsg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              ⚠️ {errorMsg}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="label">Full Name</label>
              <input {...register('full_name', { required: 'Name is required' })}
                type="text" className="input-field" placeholder="John Doe" />
              {errors.full_name && <p className="mt-1.5 text-xs text-rose-400">{errors.full_name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <input {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' }
              })}
                type="email" className="input-field" placeholder="you@example.com" />
              {errors.email && <p className="mt-1.5 text-xs text-rose-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' }
                })}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="Create a strong password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Strength Bar */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-slate-700'}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${['', 'text-rose-400', 'text-amber-400', 'text-blue-400', 'text-emerald-400'][strength]}`}>
                    {strengthLabel} password
                  </p>
                </div>
              )}
              {errors.password && <p className="mt-1.5 text-xs text-rose-400">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                  <ArrowRight size={16} className="ml-auto" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
