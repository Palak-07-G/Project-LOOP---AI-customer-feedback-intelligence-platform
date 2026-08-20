import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Building2, User, Mail, Lock } from 'lucide-react';

interface SignupPageProps {
  onGoToLogin: () => void;
  onGoToLanding: () => void;
  onSuccess: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onGoToLogin,
  onGoToLanding,
  onSuccess,
}) => {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signup(name, email, password, workspaceName);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace account');
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
          Charter a new intelligence workspace
        </h2>
        <p className="mt-1 text-center text-xs font-sans text-[#5C5850]">
          Already have an account?{' '}
          <button onClick={onGoToLogin} className="font-bold underline text-[#1A1A1A] hover:text-[#333333] cursor-pointer">
            Sign in
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] border-2 border-[#1A1A1A] py-8 px-6 shadow-[8px_8px_0px_0px_#1A1A1A] sm:px-8 space-y-5">
          {error && (
            <div className="p-3 bg-[#8E2828] text-[#F9F7F2] text-xs font-sans border border-[#8E2828] font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-[0.1em] text-[#1A1A1A] mb-1">Your Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#5C5850] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] placeholder-[#5C5850] focus:ring-1 focus:ring-[#1A1A1A] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-[0.1em] text-[#1A1A1A] mb-1">Company / Workspace Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#5C5850] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Acme Analytics"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] placeholder-[#5C5850] focus:ring-1 focus:ring-[#1A1A1A] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-[0.1em] text-[#1A1A1A] mb-1">Work Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5C5850] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@acme.com"
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
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] placeholder-[#5C5850] focus:ring-1 focus:ring-[#1A1A1A] outline-none"
                />
              </div>
            </div>

            <Button
              id="signup-submit-btn"
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full text-xs py-3 mt-2"
            >
              Charter Workspace & Admin Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

