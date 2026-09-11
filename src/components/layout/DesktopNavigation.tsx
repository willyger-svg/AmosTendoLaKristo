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
    { label: 'Home', path: '/' },
    {
      label: 'Shop Stationery',
      path: '/shop',
      badge: 'Store',
      hasDropdown: true,
      dropdownItems: [
        { label: 'All Stationery Products', path: '/shop' },
        { label: 'School Supplies', path: '/shop?category=School Supplies' },
        { label: 'Office Supplies', path: '/shop?category=Office Supplies' },
        { label: 'Writing Materials & Pens', path: '/shop?category=Writing Materials' },
        { label: 'Paper & Reams', path: '/shop?category=Paper & Printing' },
        { label: 'Files & Folders', path: '/shop?category=Files & Folders' },
        { label: 'Computer Accessories', path: '/shop?category=Computer Accessories' }
      ]
    },
    {
      label: 'Online Services',
      path: '/online-services',
      badge: 'NIDA/TRA',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Public Services Overview', path: '/online-services' },
        { label: 'NIDA Registration & NIN Lookup', path: '/online-services?focus=NIDA' },
        { label: 'TRA TIN & Tax Return Guidance', path: '/online-services?focus=TRA' },
        { label: 'Police Loss Report (Ripoti ya Upotevu)', path: '/online-services?focus=POLICE' },
        { label: 'RITA Birth & Certificate Portal', path: '/online-services?focus=RITA' },
        { label: 'NAPA / Ajira Job Recruitment Portal', path: '/online-services?focus=NAPA' },
        { label: 'BRELA & HESLB Loan Support', path: '/online-services?focus=OTHER' }
      ]
    },
    {
      label: 'Printing & Docs',
      path: '/printing',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Printing Hub & Price Estimator', path: '/printing' },
        { label: 'Upload & Print Job Request', path: '/printing/order-service' },
        { label: 'Binding & Hardcover Finishing', path: '/printing' },
        { label: 'Passport-Size Photos (Studio)', path: '/printing' },
        { label: 'Document Typing & Formatting', path: '/printing' },
        { label: 'Modern CV Preparation', path: '/printing' }
      ]
    },
    { label: 'Graphic Design', path: '/graphic-design' },
    { label: 'IT Support', path: '/it-support' },
    {
      label: 'Digital Solutions',
      path: '/digital-solutions',
      badge: 'Software',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Digital Solutions Overview', path: '/digital-solutions' },
        { label: 'Interactive Project Quote Builder', path: '/digital-solutions/request-quote' },
        { label: 'Website Development', path: '/digital-solutions' },
        { label: 'POS & Multi-Store Inventory', path: '/digital-solutions' },
        { label: 'Mobile Application Engineering', path: '/digital-solutions' },
        { label: 'Business Performance Dashboards', path: '/digital-solutions' }
      ]
    },
    { label: 'About TK', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <nav className="hidden lg:block bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  className={`flex items-center gap-1.5 px-3 py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    active
                      ? 'text-amber-400 bg-slate-800/80 border-b-2 border-amber-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded-sm bg-amber-500 text-slate-950">
                      {item.badge}
                    </span>
                  )}
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
      </div>
    </nav>
  );
};
