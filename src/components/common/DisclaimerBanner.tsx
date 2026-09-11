import React from 'react';
import { ShieldAlert, ExternalLink, Info } from 'lucide-react';

export interface DisclaimerBannerProps {
  agencyName?: string;
  officialUrl?: string;
  compact?: boolean;
  className?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  agencyName,
  officialUrl,
  compact = false,
  className = ''
}) => {
  return (
    <div
      className={`rounded-xl border border-amber-300 bg-amber-50/90 text-amber-950 p-4 sm:p-5 ${className}`}
      role="note"
      aria-label="Public Service Notice"
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-amber-200/70 rounded-lg text-amber-800 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>

        <div className="flex-1 text-xs sm:text-sm">
          <div className="font-bold text-amber-900 flex items-center gap-2">
            <span>OFFICIAL PUBLIC SERVICES NOTICE & DISCLAIMER</span>
          </div>

          <p className="mt-1 text-amber-900/90 leading-relaxed">
            <strong>TK Stationery</strong> is an independent private document typing, printing, and digital portal assistance bureau. We are <strong>NOT</strong> an official government agency, office, or representative of {agencyName || 'NIDA, TRA, Police Force, RITA, NAPA, or any ministry'}.
          </p>

          <p className="mt-1.5 text-amber-800/90 text-xs">
            Official statutory fees are paid directly to the respective government institutions via official <strong>GePG Control Numbers</strong>. TK Stationery only charges nominal service fees for typing, scanning, printing, and portal navigation assistance.
          </p>

          {officialUrl && (
            <div className="mt-3 flex items-center gap-2">
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 underline hover:text-amber-700 transition-colors"
              >
                <span>Visit Official Authority Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
