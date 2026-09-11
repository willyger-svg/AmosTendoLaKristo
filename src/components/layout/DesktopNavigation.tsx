import React, { useState } from 'react';
import {
  ChevronDown,
  ShoppingBag,
  FileCheck,
  Printer,
  Sparkles,
  Cpu,
  Globe,
  HelpCircle,
  PhoneCall,
  LayoutGrid
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DesktopNavigation: React.FC = () => {
  const { currentPath, navigateTo } = useApp();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { label: 'Nyumbani', path: '/' },
    {
      label: 'Duka la Vifaa',
      path: '/shop',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Bidhaa Zote za Vifaa', path: '/shop' },
        { label: 'Vifaa vya Shule (School Supplies)', path: '/shop?category=School Supplies' },
        { label: 'Vifaa vya Ofisi (Office Supplies)', path: '/shop?category=Office Supplies' },
        { label: 'Kalamu & Vifaa vya Kuandikia', path: '/shop?category=Writing Materials' },
        { label: 'Karatasi na Ream (A4/A3)', path: '/shop?category=Paper & Printing' },
        { label: 'Mafaili & Folders', path: '/shop?category=Files & Folders' },
        { label: 'Vifaa vya Kompyuta', path: '/shop?category=Computer Accessories' }
      ]
    },
    {
      label: 'Huduma za Chapisho',
      path: '/printing',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Kituo cha Chapisho (Printing Hub)', path: '/printing' },
        { label: 'Tuma Nyaraka ya Kuchapishwa', path: '/printing/order-service' },
        { label: 'Binding & Jalada Gumu (Hardcover)', path: '/printing' },
        { label: 'Picha za Pasipoti (Passport Photos)', path: '/printing' }
      ]
    },
    {
      label: 'Huduma za Serikali',
      path: '/online-services',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Huduma Zote za Mtandaoni', path: '/online-services' },
        { label: 'Msaada wa NIDA (NIN Lookup)', path: '/online-services?focus=NIDA' },
        { label: 'Msaada wa TRA (TIN & Tax)', path: '/online-services?focus=TRA' },
        { label: 'Ripoti ya Polisi ya Upotevu', path: '/online-services?focus=POLICE' },
        { label: 'RITA & Vyeti vya Kuzaliwa', path: '/online-services?focus=RITA' },
        { label: 'Maombi ya Ajira (Ajira Portal)', path: '/online-services?focus=NAPA' }
      ]
    },
    { label: 'Kuhusu Sisi', path: '/about' },
    { label: 'Mawasiliano', path: '/contact' }
  ];

  return (
    <nav className="hidden lg:block bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {navItems.map(item => {
            const active = isActive(item.path);

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  onClick={() => navigateTo(item.path)}
                  className={`flex items-center gap-1 px-3.5 py-3 text-xs font-semibold tracking-wide transition-colors ${
                    active
                      ? 'text-amber-400 bg-slate-800/80 border-b-2 border-amber-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.hasDropdown && (
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {item.hasDropdown && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 w-64 bg-slate-900 border border-slate-700 rounded-b-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {item.dropdownItems?.map(sub => (
                      <button
                        key={sub.label}
                        type="button"
                        onClick={() => {
                          setActiveDropdown(null);
                          navigateTo(sub.path);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors flex items-center justify-between"
                      >
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Nav Utilities */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateTo('/track-order')}
            className="text-xs font-medium text-slate-300 hover:text-amber-400 py-1.5 px-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Fuatilia Oda
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/login')}
            className="text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 py-1.5 px-3.5 rounded-lg transition-colors shadow-xs"
          >
            Akaunti Yangu
          </button>
        </div>
      </div>
    </nav>
  );
};
