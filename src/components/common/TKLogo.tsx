import React from 'react';

interface TKLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  className?: string;
  showText?: boolean;
  textColor?: 'dark' | 'light';
  subtext?: string;
  showFullTagline?: boolean;
}

const sizeMap: Record<string, { box: string; px: number }> = {
  xs: { box: 'w-7 h-7', px: 28 },
  sm: { box: 'w-9 h-9', px: 36 },
  md: { box: 'w-11 h-11', px: 44 },
  lg: { box: 'w-14 h-14', px: 56 },
  xl: { box: 'w-20 h-20', px: 80 },
  '2xl': { box: 'w-28 h-28', px: 112 },
};

export const TKLogo: React.FC<TKLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  textColor = 'dark',
  subtext,
  showFullTagline = true,
}) => {
  const sizeConfig = typeof size === 'number'
    ? { box: '', px: size }
    : sizeMap[size] || sizeMap.md;

  const styleObj = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : undefined;

  const logoIcon = (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 ${sizeConfig.box} ${className}`}
      style={styleObj}
    >
      <img
        src="/images/tendo-logo.svg"
        alt="TK Stationery - Tendo La Kristo (Amos Stationery)"
        className="w-full h-full object-contain select-none"
        referrerPolicy="no-referrer"
        loading="eager"
      />
    </div>
  );

  if (!showText) {
    return logoIcon;
  }

  return (
    <div className="flex items-center gap-3 select-none">
      {logoIcon}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`font-black tracking-tight leading-tight ${
              size === 'lg' || size === 'xl' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg'
            } ${textColor === 'light' ? 'text-white' : 'text-slate-900'}`}
          >
            TK STATIONERY
          </span>
          {showFullTagline && (
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400">
              Tendo La Kristo
            </span>
          )}
        </div>
        <span
          className={`text-[11px] font-bold tracking-wide mt-0.5 ${
            textColor === 'light' ? 'text-amber-400' : 'text-amber-600'
          }`}
        >
          {subtext || (showFullTagline ? 'Amos Stationery • Manzese (Bakhresa)' : 'Manzese, Dar es Salaam')}
        </span>
      </div>
    </div>
  );
};
