import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  Inbox,
  FileText,
  Search,
  Users,
  CheckCircle2,
  ArrowRight,
  Database,
  Lock,
  Layers,
  BookOpen,
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { useAuth } from '../context/AuthContext.js';

interface LandingPageProps {
  onGoToLogin: () => void;
  onGoToSignup: () => void;
  onLaunchDemo: (role?: 'ADMIN' | 'ANALYST' | 'VIEWER' | 'GLOBEX') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToLogin,
  onGoToSignup,
  onLaunchDemo,
}) => {
  const { switchDemoAccount } = useAuth();

  const handleQuickDemo = async (role: 'ADMIN' | 'ANALYST' | 'VIEWER' | 'GLOBEX') => {
    await switchDemoAccount(role);
    onLaunchDemo(role);
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-[#F9F7F2] font-serif">
      {/* Top Editorial Banner */}
      <div className="border-b border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2] px-4 py-1.5 text-center text-[10px] font-sans font-black uppercase tracking-[0.25em]">
        <span>Special Dispatch — Loop Customer Intelligence Journal — Issue 04</span>
      </div>

      {/* Masthead Navigation */}
      <nav className="sticky top-0 z-50 bg-[#F9F7F2]/95 backdrop-blur-md border-b-2 border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center font-serif font-black text-2xl border border-[#1A1A1A]">
              ∞
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-2xl text-[#1A1A1A] tracking-tight">LOOP</span>
                <span className="text-[9px] uppercase font-sans font-black px-1.5 py-0.5 border border-[#1A1A1A] bg-[#EBE7DF] text-[#1A1A1A]">
                  AI Journal
                </span>
              </div>
              <p className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-[#5C5850]">
                Customer Intelligence Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onGoToLogin} className="text-[10px]">
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleQuickDemo('ADMIN')}
              className="text-[10px]"
            >
              Launch Live Demo <ArrowRight className="w-3 h-3 ml-1.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A] text-[10px] font-sans font-black uppercase tracking-[0.2em] mb-6">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Vol. IV — Customer Voice Synthesis</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-[#1A1A1A] leading-[1.08] max-w-4xl mx-auto">
          Turn customer feedback into your <span className="italic font-normal">decisive advantage</span>.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#5C5850] max-w-2xl mx-auto leading-relaxed font-sans font-normal">
          LOOP unifies disparate customer feedback streams into one editorial workspace, synthesizing themes, friction points, sentiment trajectories, and grounded verbatim evidence.
        </p>

        {/* Quick Demo Access Bar */}
        <div className="mt-10 p-6 max-w-xl mx-auto bg-[#FFFFFF] border-2 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A]">
          <div className="text-[10px] font-sans font-black text-[#1A1A1A] uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#1A1A1A]" />
            <span>Instant Demo Access (130+ Pre-loaded Customer Records)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              id="landing-admin-demo-btn"
              variant="primary"
              size="sm"
              onClick={() => handleQuickDemo('ADMIN')}
              className="text-[10px] py-2.5"
            >
              Admin Demo
            </Button>
            <Button
              id="landing-analyst-demo-btn"
              variant="secondary"
              size="sm"
              onClick={() => handleQuickDemo('ANALYST')}
              className="text-[10px] py-2.5"
            >
              Analyst Demo
            </Button>
            <Button
              id="landing-viewer-demo-btn"
              variant="secondary"
              size="sm"
              onClick={() => handleQuickDemo('VIEWER')}
              className="text-[10px] py-2.5"
            >
              Viewer
            </Button>
          </div>
          <div className="text-[10px] font-mono text-[#5C5850] mt-3 pt-2 border-t border-[#1A1A1A]/10">
            Demo Credentials: <span className="font-bold text-[#1A1A1A]">admin@demo.loop</span> / <span className="font-bold text-[#1A1A1A]">LoopDemo@2026!</span>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t-2 border-[#1A1A1A]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-[#5C5850] block mb-1">
            Section I — Methodologies
          </span>
          <h2 className="text-3xl font-serif font-black text-[#1A1A1A] tracking-tight">
            How LOOP Closes the Feedback Cycle
          </h2>
          <p className="text-xs text-[#5C5850] font-sans mt-2">
            From multi-channel ingestion to structured theme clustering, grounded semantic Ask LOOP queries, and executive VoC syntheses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 bg-[#FFFFFF] border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] space-y-3">
            <div className="w-8 h-8 bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] block">
              Article 01
            </span>
            <h3 className="text-lg font-serif font-bold text-[#1A1A1A]">Automated AI Classification</h3>
            <p className="text-xs text-[#5C5850] font-sans leading-relaxed">
              Every incoming feedback item is instantly classified with sentiment scores (-1.0 to +1.0), feature area mapping, theme tags, and AI rationale with strict validation.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-[#FFFFFF] border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] space-y-3">
            <div className="w-8 h-8 bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center font-bold">
              <Search className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] block">
              Article 02
            </span>
            <h3 className="text-lg font-serif font-bold text-[#1A1A1A]">Grounded RAG Intelligence</h3>
            <p className="text-xs text-[#5C5850] font-sans leading-relaxed">
              Ask natural language questions about customer behavior. Retrieves exact evidence using semantic vector embeddings strictly isolated to your workspace with verifiable citations.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-[#FFFFFF] border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] space-y-3">
            <div className="w-8 h-8 bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] block">
              Article 03
            </span>
            <h3 className="text-lg font-serif font-bold text-[#1A1A1A]">Executive VoC Dispatches</h3>
            <p className="text-xs text-[#5C5850] font-sans leading-relaxed">
              Synthesizes quantitative metrics, detects surging complaint velocity, and generates executive summaries, friction inventories, verbatim quotes, and prioritized action plans.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Multi-Tenancy Architecture Section */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t-2 border-[#1A1A1A]">
        <div className="p-8 bg-[#EBE7DF] border-2 border-[#1A1A1A] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A] text-[9px] font-sans font-black uppercase tracking-[0.2em] mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Multi-Tenant Governance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1A1A1A] tracking-tight">
              Strict Tenant Isolation & Role-Based Security
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5850] font-sans mt-3 leading-relaxed">
              Engineered from the ground up for rigorous data privacy. Every database query, vector embedding, and AI retrieval query is strictly scoped by <span className="font-mono text-[#1A1A1A] font-bold">workspaceId</span> derived server-side.
            </p>
            <ul className="mt-5 space-y-2 text-xs text-[#1A1A1A] font-sans">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1A1A1A] shrink-0" />
                <span>Three server-enforced roles: <strong>ADMIN</strong>, <strong>ANALYST</strong>, and read-only <strong>VIEWER</strong>.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1A1A1A] shrink-0" />
                <span>Zero client-side API key leakage: all Claude and embedding calls execute securely server-side.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1A1A1A] shrink-0" />
                <span>Cross-tenant access prevention tested and verified against isolation boundaries.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 bg-[#FFFFFF] border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] font-mono text-xs text-[#1A1A1A] space-y-1.5">
            <div className="text-[#5C5850] flex items-center justify-between pb-2 border-b border-[#1A1A1A]/20">
              <span className="font-bold">server/tenant-security.ts</span>
              <span className="text-[10px] uppercase font-sans font-bold bg-[#1A1A1A] text-[#F9F7F2] px-1.5 py-0.2">Isolated</span>
            </div>
            <p className="font-bold">const session = await requireAuth(req, res);</p>
            <p className="text-[#5C5850]">// Workspace identity strictly derived from server session</p>
            <p>const feedback = await db.feedback.findMany({`{`}</p>
            <p className="pl-4">where: {`{`}</p>
            <p className="pl-8 font-bold text-[#1B4D3E]">workspaceId: session.workspaceId,</p>
            <p className="pl-8 text-[#8E2828]">sentiment: 'NEG'</p>
            <p className="pl-4">{`}`}</p>
            <p>{`}`});</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t-2 border-[#1A1A1A] bg-[#F2EFE9] text-center text-xs font-sans text-[#5C5850]">
        <p>© 2026 LOOP — AI Customer-Feedback Intelligence Journal. “Close the loop on customer feedback.”</p>
      </footer>
    </div>
  );
};

