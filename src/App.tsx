import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { Header } from './components/layout/Header.js';
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { SignupPage } from './pages/SignupPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { InboxPage } from './pages/InboxPage.js';
import { TrendsPage } from './pages/TrendsPage.js';
import { AskLoopPage } from './pages/AskLoopPage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { MembersPage } from './pages/MembersPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { AddFeedbackModal } from './components/feedback/AddFeedbackModal.js';
import { CSVImportModal } from './components/feedback/CSVImportModal.js';
import { SimulateChannelModal } from './components/feedback/SimulateChannelModal.js';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup'>('landing');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [inboxFilterThemeId, setInboxFilterThemeId] = useState<string | undefined>(undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Action Modals
  const [isAddFeedbackOpen, setIsAddFeedbackOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center font-serif font-black text-2xl border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] animate-pulse">
          ∞
        </div>
        <div className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#5C5850]">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1A1A1A]" />
          <span>Opening Intelligence Journal...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated Views
  if (!user) {
    if (authView === 'login') {
      return (
        <LoginPage
          onGoToSignup={() => setAuthView('signup')}
          onGoToLanding={() => setAuthView('landing')}
          onSuccess={() => {}}
        />
      );
    }
    if (authView === 'signup') {
      return (
        <SignupPage
          onGoToLogin={() => setAuthView('login')}
          onGoToLanding={() => setAuthView('landing')}
          onSuccess={() => {}}
        />
      );
    }
    return (
      <LandingPage
        onGoToLogin={() => setAuthView('login')}
        onGoToSignup={() => setAuthView('signup')}
        onLaunchDemo={() => {}}
      />
    );
  }

  // Authenticated Dashboard & Workspace Views
  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'Executive Overview', subtitle: 'Real-time intelligence on customer sentiment and volume trends' };
      case 'inbox':
        return { title: 'Feedback Ledger & Audit', subtitle: 'Search, filter, inspect AI classification, and triage customer records' };
      case 'trends':
        return { title: 'Thematic Trends & Velocity', subtitle: 'Monitor emerging topics, friction points, and complaint velocity' };
      case 'ask':
        return { title: 'Ask LOOP — Grounded RAG', subtitle: 'Ask natural language queries grounded in verbatim customer feedback' };
      case 'reports':
        return { title: 'Voice-of-Customer Dispatches', subtitle: 'Synthesized executive digests, customer love/struggle lists, and recommendations' };
      case 'members':
        return { title: 'Staff & Role Permissions', subtitle: 'Manage organization members and role-based permissions' };
      case 'settings':
        return { title: 'Workspace Settings & Diagnostics', subtitle: 'Multi-tenant isolation status and AI system diagnostics' };
      default:
        return { title: 'LOOP Intelligence', subtitle: 'Customer Feedback Intelligence Journal' };
    }
  };

  const handleNavigateToInboxWithTheme = (themeId?: string) => {
    setInboxFilterThemeId(themeId);
    setCurrentTab('inbox');
  };

  const { title, subtitle } = getTabTitle();

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] flex flex-col antialiased selection:bg-[#1A1A1A] selection:text-[#F9F7F2]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'inbox') setInboxFilterThemeId(undefined);
          setCurrentTab(tab);
        }}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAddFeedback={() => setIsAddFeedbackOpen(true)}
          onOpenSimulate={() => setIsSimulateOpen(true)}
          onOpenCsvImport={() => setIsCsvImportOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              key={refreshKey}
              onNavigateToInbox={handleNavigateToInboxWithTheme}
              onNavigateToAsk={() => setCurrentTab('ask')}
            />
          )}

          {currentTab === 'inbox' && (
            <InboxPage key={`${refreshKey}-${inboxFilterThemeId || 'all'}`} initialThemeId={inboxFilterThemeId} />
          )}

          {currentTab === 'trends' && (
            <TrendsPage
              key={refreshKey}
              onNavigateToInboxWithTheme={handleNavigateToInboxWithTheme}
            />
          )}

          {currentTab === 'ask' && <AskLoopPage />}

          {currentTab === 'reports' && <ReportsPage key={refreshKey} />}

          {currentTab === 'members' && <MembersPage key={refreshKey} />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Modals */}
      <AddFeedbackModal
        isOpen={isAddFeedbackOpen}
        onClose={() => setIsAddFeedbackOpen(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />

      <CSVImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />

      <SimulateChannelModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

