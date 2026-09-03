'use client';

import { useState } from 'react';
import Topbar from '@/components/Topbar';
import { inviteTeacher } from '@/lib/api/admin';

/**
 * Admin-only teacher invite form.
 *
 * Visible in the sidebar only when /api/auth/session says isAdmin, but the
 * real gate is server-side (requireAdmin in the API route) — this page just
 * fails with a 403 for anyone else who lands here directly.
 */
export default function InviteTeacherPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');

  const isValid = name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError('');
    setSentTo('');
    try {
      await inviteTeacher({ name: name.trim(), email: email.trim() });
      setSentTo(email.trim());
      setName('');
      setEmail('');
    } catch (err) {
      setError(err.message ?? 'Failed to send invite.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar crumbs={['Invite Teacher']} />
      <div className="p-6 max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight text-[#2A1F14]">Invite a teacher</h1>
        <p className="text-[#8A7556] text-sm mt-1">
          Sends a Supabase invite email. They set their own password and land as a teacher — this is the only way a teacher account gets created.
        </p>

        <form onSubmit={handleSubmit} className="bg-[#FFFDF8] rounded-xl border border-[#EADFCB] p-5 space-y-4 mt-6">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-[#F4D9D5] border border-[#E0A89F] text-red-400 text-sm">{error}</div>
          )}
          {sentTo && (
            <div className="px-4 py-3 rounded-lg bg-[#E6EBD5] border border-[#7A8C5C]/30 text-[#4F5F36] text-sm">
              Invite sent to {sentTo}.
            </div>
          )}

          <div>
            <label htmlFor="teacher-name" className="block text-xs text-[#8A7556] mb-1.5">Full name</label>
            <input
              id="teacher-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full px-3 py-2 rounded-lg bg-[#F4ECDF]/60 border border-[#DCC9A8] text-[#2A1F14] text-sm outline-none focus:border-[#C8654A] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="teacher-email" className="block text-xs text-[#8A7556] mb-1.5">Gmail address</label>
            <input
              id="teacher-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@gmail.com"
              className="w-full px-3 py-2 rounded-lg bg-[#F4ECDF]/60 border border-[#DCC9A8] text-[#2A1F14] text-sm outline-none focus:border-[#C8654A] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full py-2.5 rounded-lg bg-[#C8654A] text-white text-sm font-semibold hover:bg-[#B0533A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Sending…' : 'Send invite'}
          </button>
        </form>
      </div>
    </>
  );
}
