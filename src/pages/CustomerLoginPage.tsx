import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { TKLogo } from '../components/common/TKLogo';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  LogOut
} from 'lucide-react';

export const CustomerLoginPage: React.FC = () => {
  const { currentPath, navigateTo, showToast } = useApp();
  const { currentUser, userProfile, login, signUp, logout, resetPassword, loading } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(() => {
    if (typeof window !== 'undefined' && (window.location.pathname === '/register' || window.location.hash.includes('register'))) {
      return 'register';
    }
    return 'login';
  });

  // Sync mode with route changes
  useEffect(() => {
    if (currentPath === '/register') {
      setMode('register');
    } else if (currentPath === '/login') {
      setMode('login');
    }
  }, [currentPath]);

  const [fullName, setFullName] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Dar es Salaam');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanIdentifier = loginIdentifier.trim();
    const cleanPass = password.trim();

    if (!cleanIdentifier || !cleanPass) {
      setErrorMessage('Tafadhali jaza barua pepe au namba ya simu pamoja na nenosiri.');
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await login(cleanIdentifier, cleanPass);

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
        navigateTo('/admin');
      } else {
        showToast({
          type: 'success',
          title: 'Karibu Tena!',
          message: `Karibu tena ${profile.fullName ? profile.fullName.split(' ')[0] : 'mteja wetu'} kwenye akaunti yako.`
        });
        navigateTo('/account');
      }
    } catch (err: any) {
      console.warn('Customer Login Error:', err);
      if (err.message) {
        setErrorMessage(err.message);
      } else if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setErrorMessage('Namba ya simu/barua pepe au nenosiri si sahihi. Tafadhali hakiki taarifa zako.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Majaribio yamezidi. Tafadhali subiri kidogo kisha ujaribu tena.');
      } else {
        setErrorMessage('Hitilafu ya kuingia. Tafadhali hakiki taarifa zako au muunganisho wa intaneti.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = fullName.trim();
    const cleanEmail = registerEmail.trim();
    const cleanPhone = phone.trim();
    const cleanPass = password.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanName || !cleanPhone || !cleanPass) {
      setErrorMessage('Tafadhali jaza jina kamili, namba ya simu na nenosiri.');
      return;
    }

    if (cleanPass.length < 6) {
      setErrorMessage('Nenosiri lazima liwe na angalau herufi au tarakimu 6.');
      return;
    }

    if (cleanConfirm && cleanPass !== cleanConfirm) {
      setErrorMessage('Manenosiri hayafanani. Tafadhali hakiki kwamba nenosiri na uthibitisho wake ni sawa.');
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await signUp(cleanName, cleanEmail, cleanPass, cleanPhone, 'customer', {
        city: city.trim(),
        region: city.trim()
      });
      showToast({
        type: 'success',
        title: 'Akaunti Imefunguliwa!',
        message: `Karibu TK Stationery, ${cleanName}! Akaunti yako iko tayari.`
      });
      if (profile.role === 'super_admin' || profile.role === 'admin' || profile.role === 'staff') {
        navigateTo('/admin');
      } else {
        navigateTo('/account');
      }
    } catch (err: any) {
      console.warn('Customer Registration Error:', err);
      if (err.message) {
        setErrorMessage(err.message);
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('Namba hii ya simu au barua pepe tayari inatumika. Tafadhali bonyeza "Ingia Kwenye Akaunti".');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMessage('Tafadhali weka barua pepe sahihi au uiache wazi.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('Nenosiri ni fupi mno. Tafadhali tumia tarakimu au herufi 6 au zaidi.');
      } else {
        setErrorMessage('Imeshindikana kusajili akaunti. Tafadhali hakiki taarifa zako na ujaribu tena.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = loginIdentifier.trim() || registerEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Tafadhali weka barua pepe sahihi ya akaunti yako ili kutumiwa kiungo cha kurejesha nenosiri.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(cleanEmail);
      setSuccessMessage('Maelekezo ya kurejesha nenosiri yametumwa kwenye barua pepe yako. Tafadhali kagua inbox yako.');
      showToast({
        type: 'info',
        title: 'Kiungo Kimetumwa',
        message: 'Fungua barua pepe yako kubadili nenosiri.'
      });
    } catch (err: any) {
      console.warn('Reset password error:', err);
      setErrorMessage('Imeshindikana kutuma barua pepe ya urejeshaji. Hakikisha anwani uliyoingiza ni sahihi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchToLoginFromError = () => {
    const fallbackId = phone || registerEmail || loginIdentifier;
    if (fallbackId) setLoginIdentifier(fallbackId);
    setMode('login');
    setErrorMessage(null);
    navigateTo('/login');
  };

  const handleSwitchToRegisterFromError = () => {
    const fallbackId = loginIdentifier;
    if (fallbackId && !fallbackId.includes('@')) {
      setPhone(fallbackId);
    } else if (fallbackId && fallbackId.includes('@')) {
      setRegisterEmail(fallbackId);
    }
    setMode('register');
    setErrorMessage(null);
    navigateTo('/register');
  };

  const handleSignOutCurrent = async () => {
    await logout();
    showToast({
      type: 'info',
      title: 'Umetoka Salama',
      message: 'Umetoka kwenye akaunti. Unaweza kuingia na akaunti nyingine sasa.'
    });
  };

  return (
    <div
      className="min-h-[88vh] flex flex-col justify-center items-center px-4 py-12 relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.94)), url('https://images.unsplash.com/photo-1507842229451-79b1be886a20?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Back to Home Button */}
      <button
        type="button"
        onClick={() => navigateTo('/')}
        className="mb-6 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-xs text-slate-300 hover:text-amber-400 backdrop-blur-md transition-colors"
      >
        ← Rudi kwenye Duka Kuu la TK Stationery
      </button>

      <div className="w-full max-w-md bg-white/98 dark:bg-slate-900/98 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 text-center space-y-2 relative border-b border-slate-800">
          <TKLogo size="lg" className="mx-auto shadow-xl" />
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-[10px] font-bold text-amber-300">
            TK STATIONERY • TENDO LA KRISTO
          </div>
          <h1 className="text-xl font-black text-white">
            {mode === 'login' && 'Ingia Kwenye Akaunti (Sign In)'}
            {mode === 'register' && 'Fungua Akaunti Mpya (Sign Up)'}
            {mode === 'forgot' && 'Rudisha Nenosiri Lako'}
          </h1>
          <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
            {mode === 'login' && 'Tumia namba yako ya simu (mfano 0787 754 202) au barua pepe kuingia.'}
            {mode === 'register' && 'Fungua akaunti kwa namba yako ya simu kwa ajili ya kufuatilia oda na risiti zako.'}
            {mode === 'forgot' && 'Ingiza barua pepe yako ili upokee kiungo salama cha kubadili nenosiri.'}
          </p>
        </div>

        {/* Existing Session Notice if already logged in */}
        {userProfile && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-amber-200">
                Umeingia kama: <strong>{userProfile.fullName || userProfile.email || userProfile.phone}</strong> ({userProfile.role})
              </span>
              <button
                type="button"
                onClick={handleSignOutCurrent}
                className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 underline text-[11px]"
              >
                <LogOut className="w-3 h-3" /> Badili Akaunti
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigateTo(userProfile.role === 'customer' ? '/account' : '/admin')}
                className="w-full py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 text-center text-xs"
              >
                Endelea Kwenye Akaunti Yako →
              </button>
            </div>
          </div>
        )}

        {/* Mode Selector Tabs (Login / Register) */}
        {mode !== 'forgot' && (
          <div className="p-4 pb-0">
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  navigateTo('/login');
                }}
                className={`py-2.5 rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-extrabold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                Ingia (Log In)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  navigateTo('/register');
                }}
                className={`py-2.5 rounded-xl transition-all ${
                  mode === 'register'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-extrabold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                Fungua Akaunti (Sign Up)
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {/* Error Message with Smart Resolution Actions */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{errorMessage}</span>
              </div>
              {/* Smart Switch Action if already registered */}
              {(errorMessage.includes('tayari') || errorMessage.includes('imesajiliwa') || errorMessage.includes('inatumika')) && mode === 'register' && (
                <button
                  type="button"
                  onClick={handleSwitchToLoginFromError}
                  className="mt-1 w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>👉 Bonyeza Hapa Kuingia Kwenye Akaunti Sasa</span>
                </button>
              )}
              {/* Smart Switch Action if account not found */}
              {errorMessage.includes('haikupatikana') && mode === 'login' && (
                <button
                  type="button"
                  onClick={handleSwitchToRegisterFromError}
                  className="mt-1 w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>👉 Bonyeza Hapa Kufungua Akaunti Mpya Sasa</span>
                </button>
              )}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Namba ya Simu au Barua Pepe (Phone or Email)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder="mfano: 0787 754 202 au barua pepe"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Unaweza kutumia namba ya simu ya Tanzania (mfano: 0787 754 202 au 0754 123 456)
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenosiri (Password)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Umesahau Nenosiri?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ficha nenosiri' : 'Onyesha nenosiri'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
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
                className="mt-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md active:scale-[0.99]"
              >
                {isSubmitting || loading ? 'Inathibitisha...' : 'Ingia Kwenye Akaunti'}
              </Button>

              <div className="text-center pt-2 text-xs text-slate-600 dark:text-slate-400">
                Huna akaunti bado?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                    navigateTo('/register');
                  }}
                  className="font-bold text-slate-900 dark:text-amber-400 hover:text-amber-600 underline"
                >
                  Fungua akaunti mpya sasa
                </button>
              </div>
            </form>
          )}

          {/* Form: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Jina Kamili (Full Name) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Juma Ramadhani"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Namba ya Simu (Phone Number) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="mfano: 0787 754 202 au 0754 123 456"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Namba hii itatumika kukutumia taarifa na kuingia kwenye akaunti yako.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Barua Pepe <span className="text-slate-400 font-normal">(Sio lazima / Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={e => setRegisterEmail(e.target.value)}
                    placeholder="e.g. juma@gmail.com (au unaweza kuacha wazi)"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mkoa / Eneo (City/Region)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Manzese, Dar es Salaam"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nenosiri / Password (Tarakimu 6 au zaidi) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Weka nenosiri salama"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ficha nenosiri' : 'Onyesha nenosiri'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Thibitisha Nenosiri (Confirm Password) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Rudia nenosiri lako tena"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Ficha nenosiri' : 'Onyesha nenosiri'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={isSubmitting || loading}
                className="mt-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md active:scale-[0.99]"
              >
                {isSubmitting || loading ? 'Inasajili Akaunti...' : 'Kamilisha Usajili (Fungua Akaunti)'}
              </Button>

              <div className="text-center pt-2 text-xs text-slate-600 dark:text-slate-400">
                Tayari una akaunti?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    navigateTo('/login');
                  }}
                  className="font-bold text-slate-900 dark:text-amber-400 hover:text-amber-600 underline"
                >
                  Ingia hapa
                </button>
              </div>
            </form>
          )}

          {/* Form: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Barua Pepe Yako (Email Address)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. juma@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={isSubmitting || loading}
                className="mt-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
              >
                {isSubmitting || loading ? 'Inatuma...' : 'Tuma Kiungo cha Kurejesha Nenosiri'}
              </Button>

              <div className="text-center pt-2 text-xs text-slate-600 dark:text-slate-400">
                Unakumbuka nenosiri lako?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    navigateTo('/login');
                  }}
                  className="font-bold text-slate-900 dark:text-amber-400 hover:text-amber-600 underline"
                >
                  Rudi kwenye kuingia
                </button>
              </div>
            </form>
          )}

          {/* Trust and Security indicator */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Mfumo Salama wa Kuingia (256-Bit SSL Secured)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
