import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Clock, LogOut, CheckCircle2 } from 'lucide-react';

export const SessionTimeoutModal: React.FC = () => {
  const { sessionTimeoutWarning, dismissSessionWarning, logout } = useAuth();

  if (!sessionTimeoutWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0 animate-pulse">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">
              Ulinzi wa Kifaa cha Umma
            </span>
            <h3 className="text-lg font-black text-white leading-tight">
              Muda wa Kikao Unakaribia Kuisha
            </h3>
          </div>
        </div>

        <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <p>
            Kwa usalama wa akaunti na data yako, mfumo utakuondoa (auto logout) baada ya sekunde chache kutokana na kutotumika kwa kifaa hiki.
          </p>
          <div className="flex items-center gap-2 text-amber-300 font-medium">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>Kikao kitafungwa kiotomatiki kulinda faragha yako.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={dismissSessionWarning}
            className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold rounded-2xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Endelea Kutumia Mfumo</span>
          </button>

          <button
            type="button"
            onClick={() => logout()}
            className="py-3 px-4 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 border border-slate-700 text-slate-300 font-semibold rounded-2xl text-xs transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Ondoka Sasa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
