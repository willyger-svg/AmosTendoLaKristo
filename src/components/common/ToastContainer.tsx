import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-200 bg-white shadow-emerald-500/10',
    warning: 'border-amber-200 bg-white shadow-amber-500/10',
    error: 'border-rose-200 bg-white shadow-rose-500/10',
    info: 'border-sky-200 bg-white shadow-sky-500/10'
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            borders[t.type]
          }`}
          role="status"
        >
          {icons[t.type]}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 leading-tight">
              {t.title}
            </h4>
            <p className="mt-0.5 text-xs text-slate-600 leading-snug">
              {t.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="text-slate-400 hover:text-slate-700 p-1 -mr-1 -mt-1 rounded-md"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
