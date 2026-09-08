import React, { useState, useEffect } from 'react';
import { MemberItem, UserRole } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { RoleBadge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Users, UserPlus, ShieldCheck, Trash2, Mail, CheckCircle2 } from 'lucide-react';

export const MembersPage: React.FC = () => {
  const { user, isAdmin, isViewer } = useAuth();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Invite form
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('ANALYST');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await api.getMembers();
      setMembers(res.members);
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setError(null);
    setInviteSuccess(false);

    try {
      await api.inviteMember({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      setInviteSuccess(true);
      setInviteName('');
      setInviteEmail('');
      setTimeout(() => {
        setIsInviteOpen(false);
        setInviteSuccess(false);
        loadMembers();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to invite member');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    if (!isAdmin) return;
    try {
      await api.updateMemberRole(memberId, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Are you sure you want to remove this member from the workspace?')) return;

    try {
      await api.removeMember(memberId);
      loadMembers();
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-serif">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-5 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850]">Access Governance</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-[#1A1A1A] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1A1A1A]" />
            Workspace Team & Role Directory
          </h2>
          <p className="text-xs text-[#5C5850] font-sans mt-0.5">
            Control member access levels and permissions within {user?.workspaceName || 'this workspace'}.
          </p>
        </div>

        {isAdmin && (
          <Button
            id="invite-member-btn"
            variant="primary"
            size="sm"
            icon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={() => setIsInviteOpen(true)}
            className="text-xs"
          >
            Invite Member
          </Button>
        )}
      </div>

      {/* RBAC Info Card */}
      <div className="p-4 bg-[#FFFFFF] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#1A1A1A] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-sans font-black uppercase tracking-wider text-[11px] text-[#1A1A1A]">
            Role-Based Access Control (RBAC) Governance
          </h4>
          <p className="text-[#5C5850] font-sans leading-relaxed">
            &bull; <strong className="text-[#1A1A1A]">ADMIN</strong>: Full access (Ingest feedback, create themes, generate VoC reports, manage team roles & settings).<br />
            &bull; <strong className="text-[#1A1A1A]">ANALYST</strong>: Read/Write feedback triage, re-classify AI items, run Ask LOOP queries, and generate reports.<br />
            &bull; <strong className="text-[#1A1A1A]">VIEWER</strong>: Read-only access to dashboards, charts, and customer trends (mutations disabled).
          </p>
        </div>
      </div>

      {/* Members Table */}
      <Card className="p-0 overflow-hidden">
        <CardHeader
          title={`Team Members (${members.length})`}
          description="Users with active session credentials in this workspace"
          className="p-5 pb-0 mb-3"
        />

        {loading ? (
          <div className="p-5">
            <TableSkeleton rows={4} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#EBE7DF] text-[#1A1A1A] font-sans font-black uppercase text-[10px] tracking-wider border-b-2 border-[#1A1A1A]">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Joined Date</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]/10 font-serif">
                {members.map((m) => {
                  const isSelf = m.id === user?.id;

                  return (
                    <tr key={m.id} className="hover:bg-[#F2EFE9]">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-[#1A1A1A] text-[#F9F7F2] font-serif font-bold flex items-center justify-center text-xs">
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#1A1A1A]">
                              {m.name}
                            </span>
                            {isSelf && (
                              <span className="ml-1.5 text-[9px] font-sans font-black uppercase tracking-wider bg-[#EBE7DF] text-[#1A1A1A] px-1.5 py-0.5 border border-[#1A1A1A]">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-xs text-[#5C5850]">
                        {m.email}
                      </td>

                      <td className="py-3.5 px-3">
                        {isAdmin && !isSelf ? (
                          <select
                            value={m.role}
                            onChange={(e) => handleRoleChange(m.id, e.target.value as UserRole)}
                            className="px-2 py-1 text-[10px] font-sans font-bold uppercase tracking-wider border border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A] outline-none"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="ANALYST">ANALYST</option>
                            <option value="VIEWER">VIEWER</option>
                          </select>
                        ) : (
                          <RoleBadge role={m.role} />
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-[#5C5850] font-mono text-[11px]">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>

                      {isAdmin && (
                        <td className="py-3.5 px-4 text-right">
                          {!isSelf && (
                            <button
                              onClick={() => handleRemoveMember(m.id)}
                              className="text-[#5C5850] hover:text-[#8E2828] p-1 transition-colors"
                              title="Remove member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Team Member"
        description="Add a colleague to your workspace with specific role permissions"
        maxWidth="md"
      >
        {inviteSuccess ? (
          <div className="py-6 text-center space-y-3 font-serif">
            <div className="w-12 h-12 bg-[#1B4D3E] text-[#FFFFFF] flex items-center justify-center mx-auto border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-serif font-bold text-[#1A1A1A]">
              Team Member Invited
            </h4>
            <p className="text-xs text-[#5C5850] font-sans">
              Account created with default credentials (password: <span className="font-mono text-[#1A1A1A] font-bold">LoopDemo@2026!</span>)
            </p>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4 font-serif">
            {error && (
              <div className="p-3 bg-[#8E2828] text-[#FFFFFF] text-xs font-sans font-bold border-2 border-[#1A1A1A]">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] mb-1">
                Full Name <span className="text-[#8E2828]">*</span>
              </label>
              <input
                type="text"
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                className="w-full px-3 py-2 text-xs font-serif border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] placeholder-[#5C5850] focus:ring-1 focus:ring-[#1A1A1A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] mb-1">
                Work Email <span className="text-[#8E2828]">*</span>
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="jordan@company.com"
                className="w-full px-3 py-2 text-xs font-serif border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] placeholder-[#5C5850] focus:ring-1 focus:ring-[#1A1A1A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] mb-1">
                Access Role <span className="text-[#8E2828]">*</span>
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-[11px] font-sans font-bold uppercase tracking-wider border border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A] outline-none"
              >
                <option value="ADMIN">ADMIN — Full management & deletion rights</option>
                <option value="ANALYST">ANALYST — Triage, report generation, Ask AI</option>
                <option value="VIEWER">VIEWER — Read-only observation access</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t-2 border-[#1A1A1A]">
              <Button variant="outline" size="sm" onClick={() => setIsInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={inviteLoading}>
                Send Invitation
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

