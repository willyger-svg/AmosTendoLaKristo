import React from 'react';
import { Home, ShoppingBag, Sparkles, Search, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const { currentPath, navigateTo, cartCount, openModal } = useApp();
  const { userProfile, currentUser } = useAuth();

  const items = [
    { label: 'Home', path: '/', icon: Home },
    {
      label: 'Shop',
      path: '/shop',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined
    },
    { label: 'Quick Help', path: 'quick-help-action', icon: Sparkles, highlight: true },
    { label: 'Track', path: '/track-order', icon: Search },
    { label: 'Account', path: '/account', icon: User }
  ];

  const handleNavClick = (path: string) => {
    if (path === 'quick-help-action') {
      openModal({ type: 'quick-help' });
      return;
    }
    navigateTo(path);
  };

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 py-1.5 px-2 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map(item => {
          const isActive =
            item.path === '/'
              ? currentPath === '/'
              : item.path !== '/#what-we-do' && currentPath.startsWith(item.path);

          const IconComponent = item.icon;
          const isAccount = item.label === 'Account';
          const hasAvatar = isAccount && currentUser && userProfile?.avatarUrl;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavClick(item.path)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all min-w-[56px] min-h-[44px] ${
                item.highlight
                  ? 'text-amber-600 font-bold'
                  : isActive
                  ? 'text-amber-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                {hasAvatar ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt="Account Avatar"
                    className={`w-5 h-5 rounded-full object-cover border ${
                      isActive ? 'border-amber-600' : 'border-slate-300'
                    }`}
                  />
                ) : (
                  <IconComponent className="w-5 h-5" />
                )}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
