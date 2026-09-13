import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { activeModal, closeModal, showToast, navigateTo } = useApp();
  const { login, signUp, resetPassword, loading } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(
    activeModal?.type === 'auth-modal' && activeModal.mode ? activeModal.mode : 'login'
  );

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (activeModal?.type !== 'auth-modal') {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Tafadhali jaza barua pepe au namba ya simu pamoja na nenosiri.');
      return;
    }

    try {
      const profile = await login(email.trim(), password);
      const isStaffOrAdmin =
        profile.role === 'super_admin' ||
        profile.role === 'admin' ||
        profile.role === 'staff';

      if (isStaffOrAdmin) {
        showToast({
          type: 'success',
          title: 'Uthibitisho Umekamilika!',
          message: `Karibu ${profile.fullName || 'Msimamizi'} kwenye Jopo Kuu la Usimamizi.`
        });
        closeModal();
        navigateTo('/admin');
        return;
      }

      showToast({
        type: 'success',
        title: 'Karibu Tena!',
        message: 'Umeingia kikamilifu kwenye akaunti yako ya TK Stationery.'
      });
      closeModal();
      navigateTo('/account');
    } catch (err: any) {
      console.warn('Login error:', err);
      if (err.message) {
        setErrorMessage(err.message);
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMessage('Barua pepe / namba ya simu au nenosiri si sahihi.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Majaribio yamezidi. Tafadhali subiri dakika chache kabla ya kujaribu tena.');
      } else {
        setErrorMessage('Hitilafu ya kuingia. Tafadhali hakiki taarifa zako na ujaribu tena.');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim() || !phone.trim() || !password) {
      setErrorMessage('Tafadhali jaza jina kamili, namba ya simu na nenosiri.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Nenosiri lazima liwe na herufi au tarakimu 6 au zaidi.');
      return;
    }

    try {
      await signUp(fullName.trim(), email.trim(), password, phone.trim(), 'customer');
      showToast({
        type: 'success',
        title: 'Akaunti Imefunguliwa!',
        message: `Karibu TK Stationery, ${fullName.trim()}!`
      });
      closeModal();
      navigateTo('/account');
    } catch (err: any) {
      console.warn('Registration error:', err);
      if (err.message) {
        setErrorMessage(err.message);
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('Akaunti yenye barua pepe hii au namba ya simu tayari ipo. Tafadhali ingia.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMessage('Tafadhali weka barua pepe sahihi au uiache wazi.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('Nenosiri ni dhaifu. Tafadhali tumia herufi au tarakimu 6 au zaidi.');
      } else {
        setErrorMessage('Imeshindikana kufungua akaunti. Tafadhali jaribu tena.');
      }
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    try {
      await resetPassword(email.trim());
      setSuccessMessage('Password reset instructions have been sent to your email.');
      showToast({
        type: 'info',
        title: 'Reset Link Sent',
        message: 'Check your email inbox for password reset instructions.'
      });
    } catch (err: any) {
      console.warn('Reset password error:', err);
      setErrorMessage('Unable to send reset email. Please ensure the address is correct.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header with gradient branding */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={closeModal}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              TK Stationery Account
            </span>
          </div>

          <h2 className="text-xl font-bold text-white mt-1">
            {mode === 'login' && 'Sign In to Your Account'}
            {mode === 'register' && 'Create Customer Account'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Access your stationery orders, printing jobs, and portal tickets.'}
            {mode === 'register' && 'Track orders, quotes, and government assistance tickets in one place.'}
            {mode === 'forgot' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Error Message banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message banner */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Mode 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. juma@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] font-semibold text-amber-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
                className="mt-2 py-3"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>

              <div className="text-center pt-2 text-xs text-slate-500">
                Don’t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-slate-900 hover:text-amber-600 underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* Mode 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Juma Ramadhani"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. juma@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number (WhatsApp / Mobile)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 0754 123 456 or +255..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password (min 6 chars)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
                className="mt-2 py-3"
              >
                {loading ? 'Creating Account...' : 'Register Account'}
              </Button>

              <div className="text-center pt-2 text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-slate-900 hover:text-amber-600 underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* Mode 3: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Account Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. juma@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
                className="mt-2 py-3"
              >
                {loading ? 'Sending Link...' : 'Send Password Reset Link'}
              </Button>

              <div className="text-center pt-2 text-xs text-slate-500">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-slate-900 hover:text-amber-600 underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
