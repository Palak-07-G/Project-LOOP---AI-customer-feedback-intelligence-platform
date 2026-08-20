import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-[#1A1A1A]/70 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div
        className={`relative w-full ${maxWidthClass} bg-[#F9F7F2] text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A] z-10 overflow-hidden max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A1A] bg-[#F2EFE9]">
          <div>
            <span className="text-[9px] font-sans font-black uppercase tracking-[0.3em] text-[#5C5850] block mb-0.5">
              Dispatch Modal
            </span>
            <h3 className="text-lg font-serif font-bold text-[#1A1A1A] tracking-tight">{title}</h3>
            {description && <p className="text-xs text-[#5C5850] font-sans mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F7F2] border border-[#1A1A1A] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-[#F9F7F2]">{children}</div>
      </div>
    </div>
  );
};

