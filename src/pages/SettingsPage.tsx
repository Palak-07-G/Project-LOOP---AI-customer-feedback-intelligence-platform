import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Card, CardHeader } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { RoleBadge } from '../components/ui/Badge.js';
import {
  Building2,
  ShieldCheck,
  Cpu,
  Key,
  Server,
  Database,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (user?.workspaceId) {
      navigator.clipboard.writeText(user.workspaceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-serif">
      {/* Page Header */}
      <div className="bg-[#FFFFFF] p-5 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850]">Infrastructure & Tenancy</span>
        </div>
        <h2 className="text-xl font-serif font-bold text-[#1A1A1A]">
          Workspace & Security Settings
        </h2>
        <p className="text-xs text-[#5C5850] font-sans mt-0.5">
          Inspect workspace tenancy parameters, cryptographic isolation status, and active API engines.
        </p>
      </div>

      {/* Workspace Identity Card */}
      <Card>
        <CardHeader
          title="Organization Workspace"
          description="Tenant isolation boundary and identifier"
        />

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-[#F9F7F2] border-2 border-[#1A1A1A]">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#5C5850] block mb-1">Workspace Name</span>
              <span className="font-serif font-bold text-[#1A1A1A] text-base">
                {user?.workspaceName || 'Acme Product Labs'}
              </span>
            </div>

            <div className="p-3.5 bg-[#F9F7F2] border-2 border-[#1A1A1A] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#5C5850] block mb-1">Tenant Workspace ID</span>
                <span className="font-mono text-[#1A1A1A] font-bold text-xs">
                  {user?.workspaceId}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyId} className="text-[10px] font-sans font-bold uppercase tracking-wider h-7 px-2.5">
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="p-3 bg-[#FFFFFF] border-2 border-[#1B4D3E] shadow-[2px_2px_0px_0px_#1B4D3E] flex items-center gap-2 text-[#1B4D3E] font-serif">
            <CheckCircle2 className="w-4 h-4 text-[#1B4D3E] shrink-0" />
            <span className="text-xs font-bold">Tenant Isolation: Scoped to workspaceId in all database queries and vector indexes.</span>
          </div>
        </div>
      </Card>

      {/* User Profile Card */}
      <Card>
        <CardHeader
          title="Your Profile & Credentials"
          description="Authenticated session information"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-[#F9F7F2] border-2 border-[#1A1A1A]">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#5C5850] block mb-1">Name</span>
            <span className="font-serif font-bold text-[#1A1A1A] text-sm">{user?.name}</span>
          </div>

          <div className="p-3.5 bg-[#F9F7F2] border-2 border-[#1A1A1A]">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#5C5850] block mb-1">Email</span>
            <span className="font-mono text-[#1A1A1A] text-xs font-medium">{user?.email}</span>
          </div>

          <div className="p-3.5 bg-[#F9F7F2] border-2 border-[#1A1A1A]">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#5C5850] block mb-1">Assigned Role</span>
            <RoleBadge role={user?.role || 'ANALYST'} />
          </div>
        </div>
      </Card>

      {/* AI & Infrastructure Architecture Status */}
      <Card>
        <CardHeader
          title="AI Intelligence & Engine Status"
          description="Live configuration of models, embeddings, and database services"
        />

        <div className="space-y-3 text-xs font-serif">
          <div className="flex items-center justify-between p-3.5 bg-[#F9F7F2] border-2 border-[#1A1A1A]">
            <div className="flex items-center gap-3">
              <Cpu className="w-4 h-4 text-[#1A1A1A]" />
              <div>
                <span className="font-serif font-bold text-[#1A1A1A] block">
                  AI Classification & Synthesis
                </span>
                <span className="text-[#5C5850] font-sans text-[11px]">
                  Claude 3.5 Sonnet &bull; Gemini 2.5 Flash &bull; Deterministic Fallback Heuristics
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-sans font-black uppercase tracking-wider bg-[#1B4D3E] text-[#FFFFFF] border border-[#1A1A1A]">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[#F9F7F2] border-2 border-[#1A1A1A]">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-[#1A1A1A]" />
              <div>
                <span className="font-serif font-bold text-[#1A1A1A] block">
                  Vector Similarity & RAG Embeddings
                </span>
                <span className="text-[#5C5850] font-sans text-[11px]">
                  Semantic embeddings with Cosine Similarity math for verifiable citation grounding
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-sans font-black uppercase tracking-wider bg-[#1B4D3E] text-[#FFFFFF] border border-[#1A1A1A]">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[#F9F7F2] border-2 border-[#1A1A1A]">
            <div className="flex items-center gap-3">
              <Server className="w-4 h-4 text-[#1A1A1A]" />
              <div>
                <span className="font-serif font-bold text-[#1A1A1A] block">
                  Database & Persistence Layer
                </span>
                <span className="text-[#5C5850] font-sans text-[11px]">
                  LibSQL Engine with indexed queries on (workspaceId, createdAt, sentiment)
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-sans font-black uppercase tracking-wider bg-[#1B4D3E] text-[#FFFFFF] border border-[#1A1A1A]">
              Operational
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

