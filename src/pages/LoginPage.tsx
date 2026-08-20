import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Zap, ArrowLeft, Lock, Mail } from 'lucide-react';

interface LoginPageProps {
  onGoToSignup: () => void;
  onGoToLanding: () => void;
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onGoToSignup,
  onGoToLanding,
  onSuccess,
}) => {
  const { login, switchDemoAccount } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'ADMIN' | 'ANALYST' | 'VIEWER' | 'GLOBEX') => {
    setLoading(true);
    setError(null);
    try {
      await switchDemoAccount(role);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-serif">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={onGoToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-[0.15em] text-[#5C5850] hover:text-[#1A1A1A] mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dispatches
        </button>

        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center font-serif font-black text-2xl border border-[#1A1A1A]">
            ∞
          </div>
          <span className="font-serif font-bold text-3xl text-[#1A1A1A] tracking-tight">LOOP</span>
        </div>
        <h2 className="text-center text-xl font-serif font-bold tracking-tight text-[#1A1A1A]">
          Sign in to your Intelligence Journal
        </h2>
        <p className="mt-1 text-center text-xs font-sans text-[#5C5850]">
          Or{' '}
          <button onClick={onGoToSignup} className="font-bold underline text-[#1A1A1A] hover:text-[#333333] cursor-pointer">
            register a new organization workspace
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] border-2 border-[#1A1A1A] py-8 px-6 shadow-[8px_8px_0px_0px_#1A1A1A] sm:px-8 space-y-6">
          {error && (
            <div className="p-3 bg-[#8E2828] text-[#F9F7F2] text-xs font-sans border border-[#8E2828] font-bold">
              {error}
            </div>
          )}

          {/* Quick 1-Click Demo Buttons */}
          <div className="p-4 bg-[#F2EFE9] border border-[#1A1A1A] space-y-2.5">
            <div className="text-[10px] font-sans font-black text-[#1A1A1A] flex items-center gap-1 uppercase tracking-[0.2em]">
              <Zap className="w-3.5 h-3.5 text-[#1A1A1A]" /> 1-Click Instant Demo Credentials
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Button
                id="demo-admin-login"
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleDemoLogin('ADMIN')}
                className="text-[9px]"
              >
                Admin (Full)
              </Button>
              <Button
                id="demo-analyst-login"
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDemoLogin('ANALYST')}
                className="text-[9px]"
              >
                Analyst
              </Button>
              <Button
                id="demo-viewer-login"
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDemoLogin('VIEWER')}
                className="text-[9px]"
              >
                Viewer
              </Button>
            </div>
            <div className="pt-2 border-t border-[#1A1A1A]/20">
              <button
                id="demo-globex-login"
                type="button"
                onClick={() => handleDemoLogin('GLOBEX')}
                className="w-full text-left text-[11px] font-sans font-bold text-[#1A1A1A] hover:underline flex items-center justify-between p-1 cursor-pointer"
              >
                <span>🏢 Test Multi-Tenancy Isolation (Globex Corp)</span>
                <span className="font-mono text-[#1A1A1A]">&rarr;</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#1A1A1A]/20" />
            <span className="flex-shrink mx-4 text-[9px] uppercase font-sans font-black tracking-[0.2em] text-[#5C5850]">Or standard credentials</span>
            <div className="flex-grow border-t border-[#1A1A1A]/20" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-[0.1em] text-[#1A1A1A] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5C5850] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] placeholder-[#5C5850] focus:ring-1 focus:ring-[#1A1A1A] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-[0.1em] text-[#1A1A1A] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5C5850] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] placeholder-[#5C5850] focus:ring-1 focus:ring-[#1A1A1A] outline-none"
                />
              </div>
            </div>

            <Button
              id="login-submit-btn"
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full text-xs py-3"
            >
              Authenticate & Enter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
