import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import {
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { navigateTo, showToast } = useApp();
  const { currentUser, userProfile, isStaff, isSuperAdmin, adminLogin, logout, resetPassword, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // If already authenticated with staff/admin role, offer immediate redirect
  useEffect(() => {
    if (currentUser && isStaff) {
      // User is already authenticated as staff/admin
    }
  }, [currentUser, isStaff]);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both administrator email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await adminLogin(cleanEmail, password);
      showToast({
        type: 'success',
        title: 'Authentication Successful',
        message: `Welcome back, ${profile.fullName || profile.email} (${profile.role.toUpperCase()})`
      });
      navigateTo('/admin');
    } catch (err: any) {
      console.warn('Admin Login Error:', err);
      if (err.message && err.message.includes('Access Denied')) {
        setErrorMessage(err.message);
      } else if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setErrorMessage('Invalid administrative credentials. Please verify your email and password.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Access temporarily locked due to repeated attempts. Please try again in 5 minutes.');
      } else {
        setErrorMessage(err.message || 'Authentication error. Please verify network connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please provide your registered administrator email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(cleanEmail);
      setSuccessMessage('Password recovery instructions have been dispatched to your email.');
      showToast({
        type: 'info',
        title: 'Recovery Email Sent',
        message: 'Please check your inbox for password reset instructions.'
      });
    } catch (err: any) {
      console.warn('Password reset error:', err);
      setErrorMessage('Unable to dispatch recovery email. Verify the address is correct.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Brand Link */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigateTo('/')}
          className="text-xs font-semibold text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to TK Stationery Store</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-slate-900/90 border-b border-slate-800 p-8 text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/80 text-[10px] font-extrabold uppercase tracking-widest text-amber-400 mb-2">
            <Lock className="w-3 h-3" />
            <span>Administrator & Staff Console</span>
          </div>

          <h1 className="text-xl font-black text-white tracking-tight">
            TK Operations Access
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Authorized management portal for inventory, Tanzania payments, order dispatch, and IT service tickets.
          </p>
        </div>

        {/* Card Body */}
        <div className="p-8 space-y-5">
          {/* Active Session Status if already signed in */}
          {currentUser && isStaff && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold">Active Staff Session Detected</span>
              </div>
              <p className="text-slate-300">
                You are currently signed in as <strong>{userProfile?.fullName || currentUser.email}</strong> ({userProfile?.role.toUpperCase()}).
              </p>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => navigateTo('/admin')}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Enter Admin Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await logout();
                    showToast({ type: 'info', title: 'Signed Out', message: 'Logged out of admin session.' });
                  }}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}

          {/* Active Session Status if signed in as normal Customer */}
          {currentUser && !isStaff && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-bold">Customer Account Logged In</span>
              </div>
              <p className="text-slate-300">
                You are logged in as <strong>{currentUser.email}</strong> (Customer Tier). This portal requires Administrator or Staff privileges.
              </p>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={async () => {
                    await logout();
                    showToast({ type: 'info', title: 'Signed Out', message: 'Ready to sign in as Administrator.' });
                  }}
                  className="border-rose-700 text-rose-300 hover:bg-rose-900/40"
                >
                  Switch to Admin Account
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => navigateTo('/account')}
                >
                  Customer Account
                </Button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Authorization Failure</span>
                <span className="text-red-300 leading-relaxed block">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Standard Admin Login Form */}
          {!isForgotPassword ? (
            <form onSubmit={handleAdminSignIn} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. amosstationery@gmail.com"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] font-semibold text-amber-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={isSubmitting || loading}
                className="py-3.5 text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md"
              >
                {isSubmitting || loading ? 'Verifying Administrative Identity...' : 'Sign In to Operations Console'}
              </Button>
            </form>
          ) : (
            /* Forgot Password Form */
            <form onSubmit={handlePasswordReset} className="space-y-4 animate-in fade-in">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Registered Staff Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. amosstationery@gmail.com"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={isSubmitting}
                className="py-3.5 text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                {isSubmitting ? 'Sending Recovery Link...' : 'Send Password Reset Link'}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setErrorMessage(null);
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-white pt-2 font-medium"
              >
                &larr; Back to Admin Sign In
              </button>
            </form>
          )}

          {/* Security Assurance Notice */}
          <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <Shield className="w-3.5 h-3.5 text-amber-500/80" />
              <span>Protected by Firebase Enterprise RBAC & Security Rules</span>
            </div>
            <p className="text-[10px] text-slate-600">
              Access is restricted strictly to authorized TK Stationery operations personnel. All activities are recorded in the security audit trail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
