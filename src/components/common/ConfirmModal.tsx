import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info } from 'lucide-react';

export const ConfirmModal: React.FC = () => {
  const { activeModal, closeModal } = useApp();

  if (!activeModal || activeModal.type !== 'confirm-dialog') {
    return null;
  }

  const {
    title,
    message,
    confirmLabel = 'Confirm Action',
    cancelLabel = 'Cancel',
    onConfirm,
    isDestructive = false
  } = activeModal;

  const handleConfirm = () => {
    onConfirm();
    closeModal();
  };

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title={title}
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-full shrink-0 ${
              isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
            }`}
          >
            {isDestructive ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={closeModal}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            size="sm"
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
