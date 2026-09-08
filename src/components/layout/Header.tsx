import React from 'react';
import { Menu, Plus, RefreshCw, Sparkles, Database, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { RoleBadge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu: () => void;
  onOpenAddFeedback?: () => void;
  onOpenSimulate?: () => void;
  onOpenCsvImport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenMobileMenu,
  onOpenAddFeedback,
  onOpenSimulate,
  onOpenCsvImport,
}) => {
  const { user, isViewer } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-20 bg-[#F9F7F2]/95 backdrop-blur-xs border-b border-[#1A1A1A] px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 text-[#1A1A1A] hover:bg-[#EBE7DF] lg:hidden border border-[#1A1A1A]"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-serif font-bold text-[#1A1A1A] tracking-tight">{title}</h1>
            {user?.role && <RoleBadge role={user.role} />}
          </div>
          {subtitle && <p className="text-xs text-[#5C5850] font-sans mt-0.5 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {!isViewer && (
          <>
            {onOpenCsvImport && (
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={onOpenCsvImport}
                className="hidden sm:inline-flex text-[10px]"
              >
                Import CSV
              </Button>
            )}

            {onOpenSimulate && (
              <Button
                variant="secondary"
                size="sm"
                icon={<RefreshCw className="w-3.5 h-3.5 text-[#1A1A1A]" />}
                onClick={onOpenSimulate}
                className="text-[10px]"
              >
                <span className="hidden sm:inline">Simulate</span> Channels
              </Button>
            )}

            {onOpenAddFeedback && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={onOpenAddFeedback}
                className="text-[10px]"
              >
                + Record
              </Button>
            )}
          </>
        )}

        {isViewer && (
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] px-2.5 py-1 bg-[#F2EFE9] text-[#1A1A1A] border border-[#1A1A1A]">
            Read-Only Audit
          </span>
        )}
      </div>
    </header>
  );
};

