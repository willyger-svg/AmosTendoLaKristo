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
  ShoppingBag,
  ShieldCheck
} from 'lucide-react';

export const CustomerLoginPage: React.FC = () => {
  const { navigateTo, showToast } = useApp();
  const { currentUser, userProfile, login, signUp, resetPassword, loading } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Dar es Salaam');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to appropriate portal
  useEffect(() => {
    if (currentUser || userProfile) {
      if (userProfile?.role === 'super_admin' || userProfile?.role === 'admin' || userProfile?.role === 'staff') {
        navigateTo('/admin');
      } else {
        navigateTo('/account');
      }
    }
  }, [currentUser, userProfile, navigateTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanIdentifier = email.trim();
    if (!cleanIdentifier || !password) {
      setErrorMessage('Tafadhali jaza barua pepe au namba ya simu pamoja na nenosiri.');
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await login(cleanIdentifier, password);

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
          message: 'Umeingia kikamilifu kwenye akaunti yako ya TK Stationery.'
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
        setErrorMessage('Barua pepe au nenosiri sio sahihi. Tafadhali hakiki taarifa zako.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Majaribio yamezidi. Tafadhali subiri kidogo kisha ujaribu tena.');
      } else {
        setErrorMessage('Hitilafu ya kuingia. Tafadhali hakiki taarifa au muunganisho wa intaneti.');
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
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanPhone || !password) {
      setErrorMessage('Tafadhali jaza jina kamili, namba ya simu na nenosiri.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Nenosiri lazima liwe na herufi au tarakimu 6 au zaidi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await signUp(cleanName, cleanEmail, password, cleanPhone, 'customer', {
        city: city.trim(),
        region: city.trim()
      });
      showToast({
        type: 'success',
        title: 'Akaunti Imefunguliwa!',
        message: `Karibu TK Stationery, ${cleanName}! Taarifa zako zimehifadhiwa.`
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
        setErrorMessage('Barua pepe hii au simu tayari inatumika. Tafadhali bonyeza "Ingia Kwenye Akaunti".');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMessage('Tafadhali weka barua pepe sahihi au uiache wazi.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('Nenosiri ni fupi au dhaifu. Tafadhali tumia tarakimu au herufi 6 au zaidi.');
      } else {
        setErrorMessage('Imeshindikana kusajili. Tafadhali hakiki taarifa zako na ujaribu tena.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Tafadhali weka barua pepe ya akaunti yako.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(cleanEmail);
      setSuccessMessage('Maelekezo ya kubadili nenosiri yametumwa kwenye barua pepe yako.');
      showToast({
        type: 'info',
        title: 'Kiungo Kimetumwa',
        message: 'Fungua barua pepe yako kubadili nenosiri.'
      });
    } catch (err: any) {
      console.warn('Reset password error:', err);
      setErrorMessage('Imeshindikana kutuma barua pepe. Hakikisha anwani ni sahihi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-[88vh] flex flex-col justify-center items-center px-4 py-12 relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.92)), url('https://images.unsplash.com/photo-1507842229451-79b1be886a20?auto=format&fit=crop&w=1920&q=80')`,
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

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-7 text-center space-y-2 relative border-b border-slate-800">
          <TKLogo size="lg" className="mx-auto shadow-xl" />
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-[10px] font-bold text-amber-300">
            TK STATIONERY • TENDO LA KRISTO
          </div>
          <h1 className="text-xl font-black text-white">
            {mode === 'login' && 'Ingia Kwenye Akaunti Yako'}
            {mode === 'register' && 'Fungua Akaunti ya Mteja (Sign Up)'}
            {mode === 'forgot' && 'Rudisha Nenosiri Lako'}
          </h1>
          <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
            {mode === 'login' && 'Fuatilia oda za vifaa vya ofisi, maombi ya uchapishaji na huduma za serikali.'}
            {mode === 'register' && 'Jiunge na TK Stationery kutunza kumbukumbu za manunuzi na kupata huduma haraka.'}
            {mode === 'forgot' && 'Ingiza barua pepe yako kutumiwa kiungo cha kurejesha nenosiri.'}
          </p>
        </div>

        {/* Content */}
        <div className="p-7 space-y-4">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Barua Pepe au Namba ya Simu (Email / Phone)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. juma@gmail.com au 0754 123 456"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Nenosiri (Password)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] font-semibold text-amber-600 hover:underline"
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
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                className="mt-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                {isSubmitting || loading ? 'Inathibitisha...' : 'Ingia Kwenye Akaunti'}
              </Button>

              <div className="text-center pt-2 text-xs text-slate-600">
                Huna akaunti bado?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-slate-900 hover:text-amber-600 underline"
                >
                  Fungua akaunti sasa
                </button>
              </div>
            </form>
          )}

          {/* Form: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Jina Kamili (Full Name)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Juma Ramadhani"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Namba ya Simu (Phone Number)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 0754 123 456 au 0787 754 202"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Barua Pepe <span className="text-slate-400 font-normal">(Sio lazima)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. juma@gmail.com (au acha wazi)"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mkoa / Eneo (City/Region)</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Manzese, Dar es Salaam"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nenosiri / Password (Tarakimu 6+)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={isSubmitting || loading}
                className="mt-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                {isSubmitting || loading ? 'Inasajili Akaunti...' : 'Kamilisha Usajili (Jisajili)'}
              </Button>

              <div className="text-center pt-2 text-xs text-slate-600">
                Tayari una akaunti?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-slate-900 hover:text-amber-600 underline"
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
                <label className="text-xs font-bold text-slate-700 block mb-1">Barua Pepe Yako</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. juma@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={isSubmitting || loading}
                className="mt-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                {isSubmitting || loading ? 'Inatuma...' : 'Tuma Kiungo cha Nenosiri'}
              </Button>

              <div className="text-center pt-2 text-xs text-slate-600">
                Unakumbuka nenosiri lako?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-slate-900 hover:text-amber-600 underline"
                >
                  Rudi kwenye kuingia
                </button>
              </div>
            </form>
          )}

          {/* Trust and Security indicator */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Mfumo Salama wa Kuingia (256-Bit SSL Secured)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
