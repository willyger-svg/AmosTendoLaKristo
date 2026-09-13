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
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { activeModal, closeModal, showToast, navigateTo } = useApp();
  const { login, signUp, resetPassword, loading } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(
    activeModal?.type === 'auth-modal' && activeModal.mode ? activeModal.mode : 'login'
  );

  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (activeModal?.type !== 'auth-modal') {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setErrorMessage('Tafadhali jaza namba ya simu au barua pepe pamoja na nenosiri.');
      return;
    }

    try {
      const profile = await login(cleanIdentifier, cleanPassword);
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
        message: `Umeingia kikamilifu kama ${profile.fullName ? profile.fullName.split(' ')[0] : 'mteja wetu'}.`
      });
      closeModal();
      navigateTo('/account');
    } catch (err: any) {
      console.warn('Login error:', err);
      if (err.message) {
        setErrorMessage(err.message);
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMessage('Namba ya simu / barua pepe au nenosiri si sahihi. Hakiki taarifa zako.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Majaribio yamezidi. Tafadhali subiri kidogo kabla ya kujaribu tena.');
      } else {
        setErrorMessage('Hitilafu ya kuingia. Tafadhali hakiki taarifa zako na ujaribu tena.');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = registerEmail.trim();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanPhone || !cleanPassword) {
      setErrorMessage('Tafadhali jaza jina kamili, namba ya simu na nenosiri.');
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage('Nenosiri lazima liwe na angalau herufi au tarakimu 6.');
      return;
    }

    try {
      await signUp(cleanName, cleanEmail, cleanPassword, cleanPhone, 'customer');
      showToast({
        type: 'success',
        title: 'Akaunti Imefunguliwa!',
        message: `Karibu TK Stationery, ${cleanName}!`
      });
      closeModal();
      navigateTo('/account');
    } catch (err: any) {
      console.warn('Registration error:', err);
      if (err.message) {
        setErrorMessage(err.message);
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('Akaunti yenye namba hii ya simu au barua pepe tayari ipo. Tafadhali bonyeza "Ingia".');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMessage('Tafadhali weka barua pepe sahihi au uiache wazi.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('Nenosiri ni dhaifu. Tafadhali tumia tarakimu au herufi 6 au zaidi.');
      } else {
        setErrorMessage('Imeshindikana kufungua akaunti. Tafadhali jaribu tena.');
      }
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = identifier.trim() || registerEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Tafadhali weka barua pepe sahihi ya akaunti yako ili kutumiwa kiungo.');
      return;
    }

    try {
      await resetPassword(cleanEmail);
      setSuccessMessage('Maelekezo ya kubadili nenosiri yametumwa kwenye barua pepe yako.');
      showToast({
        type: 'info',
        title: 'Kiungo Kimetumwa',
        message: 'Kagua barua pepe yako kubadili nenosiri.'
      });
    } catch (err: any) {
      console.warn('Reset password error:', err);
      setErrorMessage('Imeshindikana kutuma barua pepe ya kurejesha nenosiri.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative border-b border-slate-800">
          <button
            type="button"
            onClick={closeModal}
            aria-label="Funga"
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              TK Stationery • Mfumo wa Akaunti
            </span>
          </div>

          <h2 className="text-xl font-bold text-white mt-1">
            {mode === 'login' && 'Ingia Kwenye Akaunti Yako'}
            {mode === 'register' && 'Fungua Akaunti ya Mteja'}
            {mode === 'forgot' && 'Rudisha Nenosiri Lako'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Tumia namba ya simu au barua pepe kufuatilia oda na huduma zako.'}
            {mode === 'register' && 'Hifadhi historia ya manunuzi, risiti na hati zako sehemu moja.'}
            {mode === 'forgot' && 'Ingiza barua pepe yako kupokea kiungo cha kubadili nenosiri.'}
          </p>
        </div>

        {/* Tab switchers */}
        {mode !== 'forgot' && (
          <div className="p-4 pb-0">
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Ingia (Sign In)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 rounded-xl transition-all ${
                  mode === 'register'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Fungua Akaunti (Sign Up)
              </button>
            </div>
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Error Message banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div className="space-y-1.5 flex-1">
                <p>{errorMessage}</p>
                {errorMessage.includes('tayari') && mode === 'register' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (phone) setIdentifier(phone);
                      setMode('login');
                      setErrorMessage(null);
                    }}
                    className="text-amber-700 dark:text-amber-400 font-bold underline text-[11px] block"
                  >
                    Bonyeza hapa kuingia kwenye akaunti sasa →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Success Message banner */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Mode 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Namba ya Simu au Barua Pepe
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="mfano: 0787 754 202 au barua pepe"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/50 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenosiri</label>
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
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/50 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
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
                disabled={loading}
                className="mt-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                {loading ? 'Inathibitisha...' : 'Ingia Kwenye Akaunti'}
              </Button>

              <div className="text-center pt-2 text-xs text-slate-500">
                Huna akaunti bado?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-slate-900 dark:text-amber-400 hover:text-amber-600 underline"
                >
                  Fungua akaunti sasa
                </button>
              </div>
            </form>
          )}

          {/* Mode 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Jina Kamili *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Juma Ramadhani"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/50 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Namba ya Simu *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="mfano: 0787 754 202 au 0754 123 456"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/50 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Barua Pepe <span className="text-slate-400 font-normal">(Sio lazima)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={e => setRegisterEmail(e.target.value)}
                    placeholder="e.g. juma@gmail.com (au acha wazi)"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/50 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Nenosiri (Tarakimu 6+) *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Weka nenosiri salama"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/50 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
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
                disabled={loading}
                className="mt-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                {loading ? 'Inafungua Akaunti...' : 'Fungua Akaunti Sasa'}
              </Button>

              <div className="text-center pt-2 text-xs text-slate-500">
                Tayari una akaunti?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-slate-900 dark:text-amber-400 hover:text-amber-600 underline"
                >
                  Ingia hapa
                </button>
              </div>
            </form>
          )}

          {/* Mode 3: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Barua Pepe ya Akaunti Yako
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="e.g. juma@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/50 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
                className="mt-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                {loading ? 'Inatuma Kiungo...' : 'Tuma Kiungo cha Nenosiri'}
              </Button>

              <div className="text-center pt-2 text-xs text-slate-500">
                Unakumbuka nenosiri lako?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-slate-900 dark:text-amber-400 hover:text-amber-600 underline"
                >
                  Rudi kwenye kuingia
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
