import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  TrendingUp,
  Sparkles,
  FileText,
  Settings,
  Users,
  Building2,
  LogOut,
  ChevronDown,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { RoleBadge } from '../ui/Badge.js';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { user, logout, switchDemoAccount, isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'inbox', label: 'Feedback Ledger', icon: Inbox },
    { id: 'trends', label: 'Themes & Velocity', icon: TrendingUp },
    { id: 'ask', label: 'Ask LOOP (RAG)', icon: Sparkles, badge: 'AI' },
    { id: 'reports', label: 'VoC Dispatches', icon: FileText },
  ];

  const adminNavItems = [
    { id: 'members', label: 'Staff & Permissions', icon: Users },
    { id: 'settings', label: 'Workspace Settings', icon: Settings },
  ];

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#F2EFE9] text-[#1A1A1A] flex flex-col border-r border-[#1A1A1A] transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-[#1A1A1A] bg-[#EBE7DF]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1A1A1A] flex items-center justify-center text-[#F9F7F2] font-serif font-black text-xl border border-[#1A1A1A]">
              ∞
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-lg text-[#1A1A1A] tracking-tight">LOOP</span>
                <span className="text-[8px] uppercase font-sans font-black px-1.5 py-0.2 bg-[#1A1A1A] text-[#F9F7F2]">
                  VOL. IV
                </span>
              </div>
              <p className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-[#5C5850]">
                Intelligence Journal
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Card */}
        <div className="p-4 mx-3 mt-3 bg-[#FFFFFF] border border-[#1A1A1A]">
          <div className="flex items-center justify-between text-[10px] text-[#5C5850] mb-1.5 font-sans font-bold uppercase tracking-[0.15em]">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[#1A1A1A]" />
              Workspace
            </span>
            <RoleBadge role={user?.role || 'ANALYST'} />
          </div>
          <p className="font-serif font-bold text-sm text-[#1A1A1A] truncate">{user?.workspaceName || 'Acme Product Labs'}</p>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[9px] font-sans font-black text-[#5C5850] uppercase tracking-[0.25em]">
            Section I — Analysis
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-sans font-bold uppercase tracking-[0.1em] transition-all cursor-pointer ${
                  active
                    ? 'bg-[#1A1A1A] text-[#F9F7F2] border border-[#1A1A1A]'
                    : 'text-[#1A1A1A] hover:bg-[#E5E0D6] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#F9F7F2]' : 'text-[#5C5850]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-mono px-1 py-0.2 border ${active ? 'border-[#F9F7F2] text-[#F9F7F2]' : 'border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A]'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[9px] font-sans font-black text-[#5C5850] uppercase tracking-[0.25em]">
            Section II — Governance
          </div>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-sans font-bold uppercase tracking-[0.1em] transition-all cursor-pointer ${
                  active
                    ? 'bg-[#1A1A1A] text-[#F9F7F2] border border-[#1A1A1A]'
                    : 'text-[#1A1A1A] hover:bg-[#E5E0D6] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#F9F7F2]' : 'text-[#5C5850]'}`} />
                  <span>{item.label}</span>
                </div>
                {!isAdmin && item.id === 'members' && (
                  <span className="text-[8px] text-[#5C5850] uppercase font-mono">Audit</span>
                )}
              </button>
            );
          })}

          {/* Quick Demo Role Switcher for Evaluators */}
          <div className="pt-4 mt-3 border-t border-[#1A1A1A]/20">
            <div className="px-3 pb-2 text-[9px] font-sans font-black text-[#1A1A1A] flex items-center gap-1 uppercase tracking-[0.2em]">
              <Zap className="w-3 h-3 text-[#1A1A1A]" /> Role Switcher
            </div>
            <div className="grid grid-cols-3 gap-1 px-1">
              <button
                id="quick-demo-admin"
                onClick={() => switchDemoAccount('ADMIN')}
                className={`text-[9px] py-1 px-1 font-sans font-bold uppercase tracking-wider text-center transition-colors border border-[#1A1A1A] cursor-pointer ${
                  user?.role === 'ADMIN' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#EBE7DF]'
                }`}
                title="Switch to Admin role"
              >
                Admin
              </button>
              <button
                id="quick-demo-analyst"
                onClick={() => switchDemoAccount('ANALYST')}
                className={`text-[9px] py-1 px-1 font-sans font-bold uppercase tracking-wider text-center transition-colors border border-[#1A1A1A] cursor-pointer ${
                  user?.role === 'ANALYST' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#EBE7DF]'
                }`}
                title="Switch to Analyst role"
              >
                Analyst
              </button>
              <button
                id="quick-demo-viewer"
                onClick={() => switchDemoAccount('VIEWER')}
                className={`text-[9px] py-1 px-1 font-sans font-bold uppercase tracking-wider text-center transition-colors border border-[#1A1A1A] cursor-pointer ${
                  user?.role === 'VIEWER' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#EBE7DF]'
                }`}
                title="Switch to Viewer (Read-only)"
              >
                Viewer
              </button>
            </div>
          </div>
        </div>

        {/* User Footer & Logout */}
        <div className="p-3 border-t border-[#1A1A1A] bg-[#EBE7DF]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 bg-[#1A1A1A] text-[#F9F7F2] font-serif font-bold flex items-center justify-center text-xs shrink-0 border border-[#1A1A1A]">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-serif font-bold text-[#1A1A1A] truncate">{user?.name || 'Demo User'}</p>
                <p className="text-[10px] font-mono text-[#5C5850] truncate">{user?.email || 'admin@demo.loop'}</p>
              </div>
            </div>
            <button
              id="sidebar-logout-btn"
              onClick={logout}
              className="p-1.5 text-[#1A1A1A] hover:bg-[#8E2828] hover:text-[#F9F7F2] border border-[#1A1A1A] transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

