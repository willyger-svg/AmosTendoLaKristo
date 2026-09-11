import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { X } from 'lucide-react';

interface AdminMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMobileDrawer: React.FC<AdminMobileDrawerProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Content */}
      <div className="relative w-80 max-w-[85vw] bg-slate-950 h-full flex flex-col shadow-2xl z-10 border-r border-slate-800">
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AdminSidebar
          isCollapsed={false}
          onToggleCollapse={() => {}}
          onNavigate={onClose}
        />
      </div>
    </div>
  );
};
